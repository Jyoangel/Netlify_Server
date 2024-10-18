module.exports = {
    v2: {
        config: jest.fn(),
        uploader: {
            upload: jest.fn().mockResolvedValue({
                secure_url: 'http://mockedurl.com/file',
            }),
        },
    },
};
