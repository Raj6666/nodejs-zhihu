const Question = require('../models/questions');

class QuestionsCtl {
    async find(ctx) {
        const { page_size = 10, page_index } = ctx.query;
        const pageIndex = Math.max(page_index * 1, 1) - 1;
        const pageSize = Math.max(page_size * 1, 1);
        const keyword = new RegExp(ctx.query.keyword);
        ctx.body = await Question
        .find({ $or: [{ title: keyword }, { description: keyword }] })
        .limit(pageSize).skip(pageIndex * pageSize);
    }
    async checkQuestionExist(ctx, next) {
        const question = await Question.findById(ctx.params.id).select('+questioner');
        if (!question) { ctx.throw(404, '问题不存在') };
        ctx.state.question = question;
        await next();
    }
    async findById(ctx) {
        const { fields = '' } = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const question = await Question.findById(ctx.params.id).select(selectFields).populate('topics questioner');
        ctx.body = question;
    }
    async create(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: true },
            description: { type: 'string', required: false }
        });
        const question = await new Question({
            ...ctx.request.body,
            questioner: ctx.state.user._id
        }).save();
        ctx.body = question;
    }
    async checkQuestioner(ctx, next) {
        const { question } = ctx.state;
        if (question.questioner.toString() !== ctx.state.user._id) { ctx.throw(403, '没有权限') }
        await next();
    }
    async update(ctx) {
        ctx.verifyParams({
            title: { type: 'string', required: false },
            description: { type: 'string', required: false }
        });
        await ctx.state.question.update(ctx.request.body);
        ctx.body = ctx.state.question;
    }
    async delete(ctx) {
        await Question.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = new QuestionsCtl();