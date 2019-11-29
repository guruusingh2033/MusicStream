const modelComment = (req) => {
    return {
        commentId: req.body.commentId,
        userId: req.body.userId,
        mediaId: req.body.mediaId,
        comment: req.body.comment
    }

}

exports.modelComment = modelComment;