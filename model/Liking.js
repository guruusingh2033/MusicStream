const modelLike = (req) =>{
    return  {
        likeId : req.body.likeId,
        userId : req.body.userId,
        mediaId : req.body.mediaId,
        like : parseInt(req.body.like)
    }    
}

exports.modelLike = modelLike;