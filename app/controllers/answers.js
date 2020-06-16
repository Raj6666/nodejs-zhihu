const Answer = require('../models/answers');

class AnswersCtl {
    async find(ctx) {
        const { page_size = 10, page_index } = ctx.query;
        const pageIndex = Math.max(page_index * 1, 1) - 1;
        const pageSize = Math.max(page_size * 1, 1);
        const keyword = new RegExp(ctx.query.keyword);
        ctx.body = await Answer
        .find({ $or: [{ content: keyword }, { questionId: ctx.params.questionId }] })
        .limit(pageSize).skip(pageIndex * pageSize);
    }
    async checkAnswerExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('+answerer');
        if (!answer) { ctx.throw(404, '答案不存在') };
        // 只有在删改查答案才检查次逻辑，赞、踩答案时候不检查
        if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) { ctx.throw(404, '该问题下无次答案') }
        ctx.state.answer = answer;
        await next();
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const answer = await Answer.findById(ctx.params.id).select(selectFields).populate('answerer');
        ctx.body = answer;
    }
    async create(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: true }
        });
        const answer = await new Answer({
            ...ctx.request.body,
            answerer: ctx.state.user._id,
            questionId: ctx.params.questionId
        }).save();
        ctx.body = answer;
    }
    async checkAnswerer(ctx, next) {
        const { answer } = ctx.state;
        if (answer.answerer.toString() !== ctx.state.user._id) { ctx.throw(403, '没有权限') }
        await next();
    }
    async update(ctx) {
        ctx.verifyParams({
            content: { type: 'string', required: false }
        });
        await ctx.state.answer.update(ctx.request.body);
        ctx.body = ctx.state.answer;
    }
    async delete(ctx) {
        await Answer.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = new AnswersCtl();