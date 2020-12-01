const { connect } = require('getstream');
require('dotenv').config()
const GS_KEY = process.env["GS_KEY"]
const GS_SECRET = process.env["GS_SECRET"]
const API_KEY = process.env["API_KEY"]
const actors = ['kam','kbm','zam','qem','jsm']

//createRandomReactions(1)
//addActivity('jsm','friend-request','user:kam',[])
// addReaction('kam','22516670-33d6-11eb-8080-800103939ea8',"friend-acceptance", ['notification:kam','notification:jsm'],{test : "what here",foreign_id:"22516670-33d6-11eb-8080-800103939ea8"}).then(
//     results => {console.dir(results)}
// ).catch(
//     err => console.log(err)
// )
///////////////////////update///////
// updateActivity('4bd12c62-33fc-11eb-8080-8000596b2d44','4b6aaeb0-33fc-11eb-8080-8000792b6721').then(
//     results => console.dir(results)
// ).catch(
//     err => console.log(err)
// )
//////////////////deletes////////////////
// deleteNotifications("qem")
// deleteReactionsByUser('qem')
// deleteActivities('qem')

//deleteAllActivities(actors)
//////////////////gets///////////////////
getActivities('kbm').then(
    results => console.dir(results)
).catch(
    err => console.log(err)
)
getReactionsByUser('kam').then(
    results => console.log(results)
).catch(
    err => console.log(err)
)
getNotifications("kam").then(
    results => console.dir(results)
).catch(
    err => console.log(err)
)
// getNotification("jsm",{id_gt: '0f232c64-2b60-11eb-8080-80012d0220fe.like1841'}).then(
//     results => console.log(results)
// ).catch(
//     err => console.log(err)
// )



function addReaction(actor,activityId,type,cc,extra){
    const client = createClient()
    const actors = ['kam','kbm','zam','qem','jsm'];
    const timeline = createUserClient(actor)
    const id = Math.floor(Math.random() * 10000)
    return timeline.reactions.add(type,activityId,{text : 'added-reaction'}, {targetFeeds: cc, 'id': id.toString(), targetFeedsExtraData : extra})
}
function addActivity(actor,verb,object,to) {
    const timeline = createFeedClient(actor)
    const verbs = ['tweet','comment','post','pin']
    const timestamp = new Date().toISOString();
    const activity_data = {'actor': actor, 'verb': verb, 'object': object, 'to': to, 'time': timestamp}
    console.log(activity_data);
    return timeline.addActivity(activity_data)
}
function updateActivity(id,foreignId) {
    const client = createClient()
    return client.activityPartialUpdate({id: id, set:{foreign_id : foreignId}})
}
function addRandomActivity() {
    // const client = createClient()
    const actors = ['kam','kbm','zam','qem','jsm']
    const actor = actors[Math.floor(Math.random() * 5)];
    const timeline = createFeedClient(actor)
    const verbs = ['tweet','comment','post','pin']
    const verb = verbs[Math.floor(Math.random() * 4)];
    const object = `${verbs[Math.floor(Math.random() * 4)]}:${Math.floor(Math.random() * 100)}`
    const timestamp = new Date().toISOString();
    const activity_data = {'actor': actor, 'verb': verb, 'object': object, 'time': timestamp}
    console.log(activity_data);
    return timeline.addActivity(activity_data)
}
async function addUser(user){
    try {
        const client = createClient()
        console.log( await client.user(user).getOrCreate({
            name: user
        }))
    } catch (e) {
        console.log("failure")
    }
}

function createClient(){
    return connect(GS_KEY, GS_SECRET);
}
function createUserClient(userId){
    const client = connect(API_KEY, GS_SECRET);
    return connect(API_KEY, client.createUserToken(userId),GS_SECRET);
}
function createFeedClient(userId) {
    const client = createClient()
    return client.feed('timeline',userId)
}
function createNotificationClient(userId) {
    const client = createClient()
    return client.feed('notification',userId)
}
function createReaction(activities){
    const client = createClient()
    const actors = ['kam','kbm','zam','qem','jsm'];
    const actor = actors[Math.floor(Math.random() * 5)];
    const author = actors[Math.floor(Math.random() * 5)];
    const timeline = createUserClient(actor)
    const activity = activities[Math.floor(Math.random() * (activities.length-1))]
    const id = Math.floor(Math.random() * 10000)
    return timeline.reactions.add('like',activity.id,{text : 'auto-generated'}, {targetFeeds: [`notification:${activity.actor}`], 'id': id.toString(), targetFeedsExtraData : {author : activity.actor}})
}
function createRandomReactions(num) {
    let activities = [];
    let activityPromises = []
    let reactionPromises = []
    for(let i=0;i<num;i++){
        activityPromises.push(addRandomActivity())
    }
    Promise.all(activityPromises).then((results) => {
        activities = results;
        for(let i=0;i<num;i++){
            reactionPromises.push(createReaction(results))
        }
        Promise.all(reactionPromises).then( results => {
            console.log(results);
        }).catch(err => {
            console.log(err)
        })
    })
        .catch((e) => {
            console.log(e)
        });
}

function deleteNotifications(userId){
    const client = createNotificationClient(userId)
    getNotifications(userId).then(
        function(results){
            results.results.forEach(
                function (activities){
                    activities.activities.forEach(
                        function (activity) {
                            client.removeActivity(activity.id).then( r => {
                                console.log(`Removed notification ${activity.id}`)
                                return r
                            }).catch(
                                function (e){
                                    return e
                                }

                            )
                        }
                    )
                }
            )
        })
}
function deleteAllActivities( users){
    users.forEach(function(userId){
        const client = createFeedClient(userId)
        getActivities(userId).then(
            function(activities){
                activities.results.forEach(
                    function (activity) {
                        client.removeActivity(activity.id).then( r => {
                            console.log(`Removed ${activity.id}`)
                            return r
                        }).catch(
                            function (e){
                                return e
                            }

                        )
                    }
                )
            })
    })
}
function deleteActivities( userId){
    const client = createFeedClient(userId)
    getActivities(userId).then(
        function(activities){
            activities.results.forEach(
                function (activity) {
                    client.removeActivity(activity.id).then( r => {
                        console.log(`Removed ${activity.id}`)
                        return r
                    }).catch(
                        function (e){
                            return e
                        }

                    )
                }
            )
        })
}
async function deleteReactionsByUser(userId) {
    let reactions = []
    let client = createUserClient(userId)
    getReactionsByUser(userId).then(
        function (results){
            reactions = results.results
            reactions.forEach(reaction => {
                client.reactions.delete(reaction.id).then(
                    console.log(`deleted ${reaction.id}`)
                ).catch(
                    e => console.log(e)
                )
            })
        }
    ).catch(
        err => console.log(err)
    )
}

function getNotifications(userId){
    const client = createNotificationClient(userId)
    return client.get()
}
function getNotification(userId,options){
    const client = createNotificationClient(userId)
    return client.get(options)
}
function getActivities(userId) {
    const client = createFeedClient(userId)
    return client.get({})
}
async function getReactionsByUser(userId){
    const userClient = createUserClient(userId)
    return await userClient.reactions.filter({user_id: userId})
}

