const jwt = require('koa-jwt');
const { secret } = require('../config');
const Router = require('koa-router');
const router = new Router({ prefix: '/users' });
const {find, findById, create, update, delete: del, login, checkOwner,
    listFollowing, listFollowers, checkUserExist, follow, unfollow,
    listFollowingTopics, followTopic, unfollowTopic,
    listQuestions,
    listLikingAnswers, likeAnswer, unLikeAnswer,
    listDislikingAnswers, dislikeAnswer, unDislikeAnswer,
    listCollectingAnswers, collectAnswer, unCollectAnswer
} = require('../controllers/users');
const { checkTopicExist } = require('../controllers/topics');
const { checkAnswerExist } = require('../controllers/answers');
const auth = jwt({ secret });

router.get('/', find);
router.post('/', create);
router.get('/:id', findById);
router.patch('/:id', auth, checkOwner, update);
router.delete('/:id', auth, checkOwner, del);
router.post('/login', login);
// 关注人列表，粉丝列表，关注某人，取消关注某人
router.get('/:id/following', listFollowing);
router.get('/:id/followers', listFollowers);
router.put('/following/:id', auth, checkUserExist, follow);
router.delete('/following/:id', auth, checkUserExist, unfollow);
// 关注话题列表，关注话题，取消关注话题
router.get('/:id/followingTopics', listFollowingTopics);
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic);
router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic);
// 问题列表
router.get('/:id/questions', listQuestions);
// 点赞答案列表，点赞答案，取消点赞答案
router.get('/:id/likingAnswers', listLikingAnswers);
router.put('/likingAnswers/:id', auth, checkAnswerExist, likeAnswer, unDislikeAnswer);
router.delete('/likingAnswers/:id', auth, checkAnswerExist, unLikeAnswer);
// 点踩答案列表，点踩答案，取消点踩答案
router.get('/:id/dislikingAnswers', listDislikingAnswers);
router.put('/dislikingAnswers/:id', auth, checkAnswerExist, dislikeAnswer, unLikeAnswer);
router.delete('/dislikingAnswers/:id', auth, checkAnswerExist, unDislikeAnswer);
// 收藏答案列表，收藏答案，取消收藏答案
router.get('/:id/collectingAnswers', listCollectingAnswers);
router.put('/collectingAnswers/:id', auth, checkAnswerExist,collectAnswer);
router.delete('/collectingAnswers/:id', auth, checkAnswerExist, unCollectAnswer);
module.exports = router;