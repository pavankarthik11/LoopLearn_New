

const asyncHandler = (requestHandler) => async (req, res, next) => {
    try {
        await requestHandler(req, res, next)
    } catch (err) {
        console.error('API Error:', err); // Log the error for debugging
        // Log err.code for debugging
        if (err.code) {
            console.error('Error code:', err.code);
        }
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message
        })
    }
}


export { asyncHandler }