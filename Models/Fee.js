const mongoose = require('mongoose');
const { Schema } = mongoose;
const numberToWords = require('number-to-words');

const feeSchema = new Schema({
    studentID: {
        type: Schema.Types.ObjectId,
        ref: 'StudentDetail',
        required: true
    },
    feePaid: {
        type: Number,
        required: true
    },
    otherFee: {
        type: Number
    },
    total: {
        type: Number,
    },
    paidAmount: {
        type: Number,
        required: true,
        default: function () {
            return this.feePaid + (this.otherFee || 0);
        }
    },
    extraFee: {
        type: Number,
        required: true,
    },
    dueAmount: {
        type: Number,
        required: true,
    },
    totalDues: {
        type: Number,
        required: true,
    },
    feeMonth: {
        type: String,
        required: true,
        enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    receiptNo: {
        type: Number,
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Due', 'Paid'],
        default: 'Due'
    },
    date: {
        type: Date,
        default: Date.now
    },
    amountInWords: {
        type: String
    },
    paymentMode: {
        type: String
    },
    referenceNo: {
        type: String
    },
    bankName: {
        type: String
    },
    remark: {
        type: String
    },
    printDate: {
        type: Date,
        default: Date.now
    },
    receiptBy: {
        type: String
    },
    srNo: {
        type: Number
    }
}, { timestamps: true });

// Pre-save middleware to set receiptNo, srNo, calculate dueAmount and totalDues
// Pre-save middleware to set receiptNo, srNo, calculate dueAmount and totalDues
feeSchema.pre('save', async function (next) {   // mongoose hooks
    const doc = this;

    if (doc.isNew) {
        await generateFeeDetails(doc, next);
    } else {
        next();
    }
});

// Pre-update middleware to recalculate total, dueAmount, and other related fields
feeSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    const { feePaid, otherFee } = update.$set;

    if (feePaid !== undefined || otherFee !== undefined) {
        const doc = await this.model.findOne(this.getQuery());
        const newFeePaid = feePaid !== undefined ? feePaid : doc.feePaid;
        const newOtherFee = otherFee !== undefined ? otherFee : doc.otherFee;

        doc.feePaid = newFeePaid;
        doc.otherFee = newOtherFee;

        await generateFeeDetails(doc, next, update);
    } else {
        next();
    }
});

// Helper function to calculate and set the required fields


function getPreviousMonth(currentMonth) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentIndex = months.indexOf(currentMonth);
    return months[(currentIndex - 1) % 12];
}

async function generateFeeDetails(doc, next, update = null) {
    try {
        console.log('New document - generating receiptNo and srNo');

        // Find the last document sorted by `receiptNo` and `srNo`
        const lastFee = await mongoose.model('Fee').findOne().sort({ receiptNo: -1 });
        const lastSrNo = await mongoose.model('Fee').findOne().sort({ srNo: -1 });

        // Generate receiptNo and srNo
        doc.receiptNo = lastFee ? lastFee.receiptNo + 1 : 1;
        doc.srNo = lastSrNo ? lastSrNo.srNo + 1 : 1;
        console.log('Generated receiptNo:', doc.receiptNo, 'srNo:', doc.srNo);

        // Calculate total and paidAmount
        doc.total = parseFloat((doc.feePaid + (doc.otherFee || 0)).toFixed(2));
        doc.paidAmount = parseFloat(doc.total.toFixed(2));

        const currentMonth = new Date().toLocaleString('default', { month: 'long' });

        // Retrieve the previous extra fee from the database
        const previousMonth = getPreviousMonth(currentMonth); // implement a function to get the previous month
        const previousMonthFee = await mongoose
            .model('Fee')
            .findOne({ studentID: doc.studentID, feeMonth: previousMonth, dueAmount: 0 })
            .sort({ createdAt: -1 });

        console.log('Previous extra fee:', previousMonthFee);
        doc.previousExtraMonthFee = previousMonthFee ? previousMonthFee.extraFee : 0;
        console.log('Previous extra fee:', doc.previousExtraMonthFee);

        // Calculate the total amount paid, including the previous extra fee
        const totalAmountPaid = parseFloat((doc.paidAmount + doc.previousExtraMonthFee).toFixed(2));
        console.log("totalAmountPaid", totalAmountPaid);

        const student = await mongoose.model('StudentDetail').findById(doc.studentID);
        if (!student) {
            return next(new Error('Student not found'));
        }

        const monthlyFee = parseFloat(student.monthlyFee.toFixed(2)); // Ensure monthlyFee has 2 decimal places

        // Retrieve the previous extra fee from the database
        const previousFee = await mongoose
            .model('Fee')
            .findOne({ studentID: doc.studentID, feeMonth: currentMonth, dueAmount: 0 })
            .sort({ createdAt: -1 });

        console.log('Previous extra fee:', previousFee);
        doc.previousExtraFee = previousFee ? previousFee.extraFee : 0;
        console.log('Previous extra fee:', doc.previousExtraFee);

        // If there is a previous fee record with `dueAmount` of 0 for the current month, add `previousExtraFee` to the new `paidAmount`
        if (previousFee) {
            doc.extraFee = parseFloat((doc.previousExtraFee + doc.paidAmount).toFixed(2));
        } else {
            doc.extraFee = 0;
        }

        console.log('Calculated extra fee:', doc.extraFee);

        // Initialize the due amount for the current month
        if (!doc.dueMonth) {
            doc.dueMonth = {}; // Initialize dueMonth as an empty object if it's not defined
        }

        // Log the initial state of dueMonth and monthlyFee
        console.log('Initial dueMonth:', doc.dueMonth);
        console.log('Monthly Fee:', monthlyFee);

        // Initialize the due amount for the current month
        let dueAmountForCurrentMonth = (doc.dueMonth[currentMonth] !== undefined && doc.dueMonth[currentMonth] !== null)
            ? doc.dueMonth[currentMonth]
            : monthlyFee;

        console.log('Calculated dueAmountForCurrentMonth:', dueAmountForCurrentMonth);

        // Calculate the effective amount for the current month
        if (totalAmountPaid >= dueAmountForCurrentMonth) {
            // If paid amount covers the due amount
            doc.extraFee = parseFloat((totalAmountPaid - dueAmountForCurrentMonth).toFixed(2)); // Calculate extra fee
            doc.dueMonth[currentMonth] = 0; // Dues for the month are cleared
            doc.dueAmount = 0; // Clear dueAmount as well
            console.log('Paid amount covers the due amount. Extra Fee:', doc.extraFee);
        } else {
            // If paid amount is less than the due amount
            doc.extraFee = doc.extraFee; // Reset extra fee if not exceeded
            doc.dueMonth[currentMonth] = parseFloat(Math.max(dueAmountForCurrentMonth - totalAmountPaid, 0).toFixed(2)); // Update dues
            console.log('Paid amount does not cover the due amount. New Dues:', doc.dueMonth[currentMonth]);
            doc.dueAmount = doc.dueMonth[currentMonth];
        }

        // Log the final state of the dueMonth and extraFee
        console.log('Final dueMonth:', doc.dueMonth);
        console.log('Final extraFee:', doc.extraFee);

        // Calculate total paid amount from previous records
        const totalPaid = await mongoose.model('Fee').aggregate([
            { $match: { studentID: doc.studentID } },
            { $group: { _id: null, totalPaidAmount: { $sum: "$paidAmount" } } }
        ]);

        // Calculate total dues
        const previousTotalPaidAmount = totalPaid[0]?.totalPaidAmount || 0;
        const totalFeeOwed = parseFloat(student.totalFee.toFixed(2)); // Total fee owed for the student
        doc.totalDues = parseFloat(Math.max(0, totalFeeOwed - previousTotalPaidAmount - doc.paidAmount).toFixed(2));

        // Determine status based on total dues
        doc.status = doc.totalDues <= 0 ? 'Paid' : 'Due';
        doc.amountInWords = numberToWords.toWords(doc.paidAmount) + ' only';

        // If updating, set the appropriate fields
        if (update) {
            update.$set.total = doc.total;
            update.$set.paidAmount = doc.paidAmount;
            update.$set.extraFee = doc.extraFee;
            update.$set.dueAmount = doc.dueAmount;
            update.$set.totalDues = doc.totalDues;
            update.$set.status = doc.status;
            update.$set.amountInWords = doc.amountInWords;
        }

        next();
    } catch (err) {
        console.error('Error generating fee details:', err);
        next(err);
    }
}

















const Fee = mongoose.model('Fee', feeSchema);

module.exports = Fee;


{/*
const feeSchema = new Schema({
    studentID: {
        type: Schema.Types.ObjectId,
        ref: 'StudentDetail',
        required: true
    },
    feePaid: {
        type: Number,
        required: true
    },
    otherFee: {
        type: Number
    },
    total: {
        type: Number,
    },
    paidAmount: {
        type: Number,
        required: true,
        default: function () {
            return this.feePaid + (this.otherFee || 0);
        }
    },
    dueAmount: {
        type: Number,
        required: true,
        default: function () {
            return this.totalFee - this.paidAmount;
        }
    },
    feeMonth: {
        type: String,
        required: true,
        enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    },
    receiptNo: {
        type: Number,
        unique: true
    },
    status: {
        type: String,
        required: true,
        enum: ['Due', 'Paid'],
        default: 'Due'
    },
    registrationNo: {
        type: String
    },
    number: {
        type: String
    },
    schoolEmail: {
        type: String
    },

    date: {
        type: Date,
        default: Date.now
    },
    amountInWords: {
        type: String
    },
    paymentMode: {
        type: String
    },
    referenceNo: {
        type: String
    },
    bankName: {
        type: String
    },
    remark: {
        type: String
    },
    printDate: {
        type: Date,
        default: Date.now
    },
    receiptBy: {
        type: String
    },
    srNo: {
        type: Number
    }
}, { timestamps: true });

// Calculate total based on MonthlyFee and festiveFee
feeSchema.pre('save', async function (next) {
    const doc = this;

    if (doc.isNew) {
        try {
            console.log('New document - generating receiptNo and srNo');
            const lastFee = await Fee.findOne().sort({ receiptNo: -1 });
            console.log('Last fee found:', lastFee);

            if (lastFee) {
                doc.receiptNo = lastFee.receiptNo + 1;
            } else {
                doc.receiptNo = 1;
            }

            // Calculate total based on MonthlyFee and festiveFee
            doc.total = doc.feePaid + (doc.otherFee || 0);

            // Calculate due amount and determine status
            doc.dueAmount = doc.totalFee - doc.paidAmount;
            doc.status = doc.dueAmount <= 0 ? 'Paid' : 'Due';

            // Convert paidAmount to words
            doc.amountInWords = numberToWords.toWords(doc.paidAmount) + ' only';

            // Calculate srNo dynamically
            const lastSrNoFee = await Fee.findOne().sort({ srNo: -1 });
            doc.srNo = lastSrNoFee ? lastSrNoFee.srNo + 1 : 1;

            console.log('New fee with receiptNo and srNo:', doc);
            next();
        } catch (err) {
            console.error('Error in pre save:', err);
            next(err);
        }
    } else {
        next();
    }
});

const Fee = mongoose.model('Fee', feeSchema);

module.exports = Fee;
*/}
