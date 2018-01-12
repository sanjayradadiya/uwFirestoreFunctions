const functions = require('firebase-functions');
const _ = require('lodash');
const request = require('request-promise');

exports.indexUserDataToElastic = functions.firestore.document('userdata/{userId}')
    .onWrite(event => {
        let userData = event.data.data();
        let userId = event.params.userId;

        console.log('Indexing user ', userId, userData);

        let elasticsearchFields = ['name','description','id','priority'];
        let elasticSearchConfig = functions.config().elasticsearch;
        let elasticSearchUrl = elasticSearchConfig.url + 'userdata/userdata/' + userId;
        let elasticSearchMethod = userData ? 'POST' : 'DELETE';

        let elasticsearchRequest = {
            method: elasticSearchMethod,
            uri: elasticSearchUrl,
            auth: {
                username: elasticSearchConfig.username,
                password: elasticSearchConfig.password,
            },
            body: _.pick(userData, elasticsearchFields),
            json: true
        };

        return request(elasticsearchRequest).then(response => {
            console.log('Elasticsearch response', response);
        }).catch((error)=>{
            console.error(error);
        });

    });