const Router = require('koa-router');
const router = new Router();
const userController = require('../controller/user');
const validation = require('koa2-validation');
var requestModel = require('../requestModel/users');
const BASE_URL = `/users`;

router.post(`${BASE_URL}/`, validation(requestModel[0]), userController.createUser);

router.get(`${BASE_URL}/`, userController.getUsers);

router.put(`${BASE_URL}/:userId`, userController.updateUser);

router.get(`${BASE_URL}/:userId`, userController.getUserDetails);

router.delete(`${BASE_URL}/:userId`, userController.deleteUser);

module.exports = router;
