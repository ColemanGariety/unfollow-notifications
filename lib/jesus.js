/*
 * jesus.js
 * The son of god lets you know when you get unfollowed on Twitter.
 * 1.0.0
 * by Jackson Gariety (http://jacksongariety.com)
 */

!function () {
  // Config
  var config = require('./config.json')
  
  // Classes
  var Twitter = require('twit')
    , Promise = require('bluebird')
  
  // Instances
  var twitter = new Twitter(config.twitter_keys)
    , followerCache = new Array
  
  // Initialize
  setInterval(function () {
    getFollowersOf(config.handle)
      .then(getScreenNamesOf)
      .then(send)
  }, 120000)
  
  // Private
  function getFollowersOf(handle) {
    var resolver = Promise.pending()
    
    twitter.get('followers/ids', function (err, followers) {
      if (err) throw err
  
      var unfollows = findUnfollows(followerCache, followers)
  
      followerCache = followers.ids
  
      resolver.fulfill(unfollows)
    })
    
    return resolver.promise
  }

  function findUnfollows(followerCache, followers) {
    var unfollows = []
    
    for (var i = followerCache.length; i--;) followers.ids.indexOf(followerCache[i]) === -1 && unfollows.push(followerCache[i])
    
    return unfollows
  }
  
  function getScreenNamesOf(unfollows) {
    var resolver = Promise.pending()
      , message = "You've been unfollowed by"
    
    for (var i = unfollows.length; i--;) {
      twitter.get('users/show', { user_id: unfollows[i] }, function (err, unfollower) {
        if (err) throw err
        
        message += (" @" + unfollower.screen_name)
        
        if (i < 0) {
          message += "."
          resolver.fulfill(message);
        } else {
          message += ","
        }
      })
    }
    
    return resolver.promise
  }
  
  function send(message) {
    twitter.post('direct_messages/new', { screen_name: config.handle, text: message }, function (err, res) {
      if (err) throw err
    
      console.log(message)
    })
  }
}()