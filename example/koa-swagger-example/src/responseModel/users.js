// The name of each response payload should be  model name defined in Request model schema and should sufix with ResponseModel.

module.exports = {
    createUser: {
        201: {
            message: {
                type: 'string'
            }
        },
        500: {
            internal: {
                type: 'string'
            }
        }
    },
    getUsers: {
        200: [{
            id: {
                type: 'number'
            },
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string'
            },
            address: {
                type: 'string'
            },
            contact: {
                type: 'number'
            },
            createdAt: {
                type: 'number',
                format: 'date-time'
            },
            updatedAt: {
                type: 'number',
                format: 'date-time'
            }
        }],
        500: {
            internal: {
                type: 'string'
            }
        }
    },
    updateUser: {
        201: {
            message: {
                type: 'string'
            }
        },
        500: {
            internal: {
                type: 'string'
            }
        }
    },
    getUserDetails: {
        200: {
            id: {
                type: 'number'
            },
            firstName: {
                type: 'string'
            },
            lastName: {
                type: 'string'
            },
            address: {
                type: 'string'
            },
            contact: {
                type: 'number'
            },
            createdAt: {
                type: 'number',
                format: 'date-time'
            },
            updatedAt: {
                type: 'number',
                format: 'date-time'
            }
        },
        500: {
            internal: {
                type: 'string'
            }
        }
    },
};