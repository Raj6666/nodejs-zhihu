const Comment = require('../models/comments');

class CommentsCtl {
    async find(ctx) {
        const { page_size = 10, page_index } = ctx.query;
        const pageIndex = Math.max(page_index * 1, 1) - 1;
        const pageSize = Math.max(page_size * 1, 1);
        const keyword = new RegExp(ctx.query.keyword);
        const { questionId, answerId } = ctx.params;
        const { rootCommentId } = ctx.query;
        ctx.body = await Comment
        .find({content: keyword, questionId, answerId, rootCommentId})
        .limit(pageSize).skip(pageIndex * pageSize)
        .populate('commentator replyTo');
    }
    async checkCommentExist(ctx, next) {
        const comment = await Comment.findById(ctx.params.id).select('+commentator');
        if (!comment) { ctx.throw(404, '评论不存在') };
        // 只有在删改查答案才检查次逻辑，赞、踩答案时候不检查
        if (ctx.params.questionId && comment.questionId !== ctx.params.questionId) { ctx.throw(404, '该问题下无此评论') }
        if (ctx.params.answerId && comment.answerId !== ctx.params.answerId) { ctx.throw(404, '该回答下无此评论') }
        ctx.state.comment = comment;
        await next();
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const comment = await Comment.findById(ctx.params.id).select(selectFields).populate('commentator');
        ctx.body = comment;
    }
    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true },
            rootCommentId: { type: 'string', required: false },
            replyTo: { type: 'string', required: false }
        });
        const comment = await new Comment({
            ...ctx.request.body,
            commentator: ctx.state.user._id,
            questionId: ctx.params.questionId,
            answerId: ctx.params.answerId
        }).save();
        ctx.body = comment;
    }
    async checkCommentator(ctx, next) {
        const { comment } = ctx.state;
        if (comment.commentator.toString() !== ctx.state.user._id) { ctx.throw(403, '没有权限') }
        await next();
    }
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false }
        });
        const { content } = ctx.request.body;
        await ctx.state.comment.update({ content });
        ctx.body = ctx.state.comment;
    }
    async delete(ctx) {
        await Comment.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = new CommentsCtl();