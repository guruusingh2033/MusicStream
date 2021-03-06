const db = require('./connection');
const commnet = require('../model/comment');

const addComment = (req, res) => {
    const value = commnet.modelComment(req);
    db.query("CALL sp_CommentInsert(?, ?, ?, @p_return);", [value.userId, value.mediaId, value.comment], (err, rows) => {
        if (err)
            return res.status(200).json({ success: "Internal Server error ", err: err })
        // if  rows[0][0].p_return == 3 comment updated
        if (rows[0][0].p_return > 0) {
            return res.status(200).json([{ success: 'Inserted' }]);
        }
        if (rows[0][0].p_return == -1)
            return res.status(200).json([{ success: 'User does not exists' }]);
        if (rows[0][0].p_return == -2)
            return res.status(200).json([{ success: 'Media does not exists' }]);

        return res.status(200).json([{ success: 'Not inserted' }]);
    })
}

const fetchComment = (req, res) => {
    const value = commnet.modelComment(req);
    db.query("CALL sp_CommentFetch(?);", [value.mediaId], (err, rows) => {
        if (err)
            return res.status(200).json({ success: "Internal Server error ", err: err })
        if (rows[0].length > 0) {
            rows[0][0].success = "Successfully fetched records";
            return res.status(200).json(rows[0]);
        }
        return res.status(200).json([{ thumbnailPath: 'No record found' }]);
    })
}

const countLikeCommentByMedidId = (req, res) => {
    const value = commnet.modelComment(req);
    db.query("CALL sp_CountLikeCommentByMedidId(?);", [value.mediaId], (err, rows) => {
        if (err)
            return res.status(200).json({ success: "Internal Server error ", err: err })
        if (rows[0].length > 0) {
            rows[0][0].success = "Successfully fetched records";
            return res.status(200).json(rows[0]);
        }
        return res.status(200).json([{ success: 'No record found' }]);
    })
}

exports.addComment = addComment;
exports.fetchComment = fetchComment;
exports.countLikeCommentByMedidId = countLikeCommentByMedidId;