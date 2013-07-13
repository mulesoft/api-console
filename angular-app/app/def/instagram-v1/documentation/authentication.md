Instagram’s API uses the [OAuth 2.0 protocol](http://tools.ietf.org/html/draft-ietf-oauth-v2-12) for simple, but effective authentication and authorization. OAuth 2.0 is much easier to use than previous schemes; developers can start using the Instagram API almost immediately. The one thing to keep in mind is that all requests to the API must be made over SSL (https:// not http://)

## Do you need to authenticate?

For the most part, Instagram’s API only requires the use of a _client_id). A client_id simply associates your server, script, or program with a specific application. However, some requests require authentication - specifically requests made on behalf of a user. Authenticated requests require an _access_token_. These tokens are unique to a user and should be stored securely. Access tokens may expire at any time in the future.

Note that in many situations, you may not need to authenticate users at all. For instance, you may request popular photos without authenticating (i.e. you do not need to provide an access_token; just use your client ID with your request). We only require authentication in cases where your application is making requests on behalf of a user (commenting, liking, browsing a user’s feed, etc.).

## Receiving an access_token

In order to receive an access_token, you must do the following:

- Direct the user to our authorization url.
  * If the user is not logged in, they will be asked to log in.
  * The user will be asked if they’d like to give your application access to his/her Instagram data.
- The server will redirect the user in one of two ways that you choose:
  * *Server-side* flow (reccommended):Redirect the user to a URI of your choice. Take the provided 
     code parameter and exchange it for an access_token by POSTing the code to our access_token url.
  * *Implicit flow*: Instead of handling a code, we include the access_token as a fragment (#) in the URL.          This method allows applications without any server component to receive an access_token with ease.

## Server-side (Explicit) Flow

Using the server-side flow is quite easy. Simply follow these steps:

### Step One: Direct your user to our authorization URL

```
https://api.instagram.com/oauth/authorize/?client_id=CLIENT-ID&redirect_uri=REDIRECT-URI&response_type=code
```

*Note:* You may provide an optional *scope* parameter to request additional permissions outside of the “basic” permissions scope. [Learn more about scope](http://instagram.com/developer/authentication/#scope).

*Note*: You may provide an optional *state* parameter to carry through any server-specific state you need to, for example, protect against CSRF issues.

At this point, we present the user with a login screen and then a confirmation screen where they approve your app’s access to his/her Instagram data.

### Step Two: Receive the redirect from Instagram

Once a user successfully authenticates and authorizes your application, we will redirect the user to your redirect_uri with a code parameter that you’ll use in step three.

```
http://your-redirect-uri?code=CODE
```

Note that your redirect URI's host and path MUST match exactly (including trailing slashes) to your registered redirect_uri. You may also include additional query parameters in the supplied redirect_uri, if you need to vary your behavior dynamically. Examples:

|REGISTERED REDIRECT URI           |REDIRECT URI SENT TO /AUTHORIZE                |VALID?|
|----------------------------------|-----------------------------------------------|------|
|http://yourcallback.com/          |http://yourcallback.com/                       |yes   |
|http://yourcallback.com/          |http://yourcallback.com/?this=that             |yes   |
|http://yourcallback.com/?this=that|http://yourcallback.com/                       |no    |
|http://yourcallback.com/?this=that|http://yourcallback.com/?this=that&another=true|yes   |
|http://yourcallback.com/?this=that|http://yourcallback.com/?another=true&this=that|no    |
|http://yourcallback.com/callback  |http://yourcallback.com/                       |no    |
|http://yourcallback.com/callback  |http://yourcallback.com/callback/?type=mobile  |yes   |

If your request for approval is denied by the user, then we will redirect the user to your *redirect_uri* with the following parameters:

* *error*: access_denied

* *error_reason*: user_denied

* *error_description*: The user denied your request

```
http://your-redirect-uri?error=access_denied&error_reason=user_denied&error_description=The+user+denied+your+request
```

It is your responsibility to fail gracefully in this situation and display a corresponding error message to your user.

### Step Three: Request the access_token

In the previous step, you’ll have received a code which you’ll have to exchange in order to receive an access_token for the user. In order to make this exchange, you simply have to POST this code, along with some app identification parameters to our access_token endpoint. Here are the required parameters:

* *client_id*: your client id
* *client_secret*: your client secret
* *grant_type*: authorization_code is currently the only supported value
redirect_uri: the redirect_uri you used in the authorization request. Note: this has to be the same value as in the authorization request.
* *code*: the exact code you received during the authorization step.

For example, you could request an access_token like so:

```
curl \-F 'client_id=CLIENT-ID' \
    -F 'client_secret=CLIENT-SECRET' \
    -F 'grant_type=authorization_code' \
    -F 'redirect_uri=YOUR-REDIRECT-URI' \
    -F 'code=CODE' \https://api.instagram.com/oauth/access_token
```

If successful, this call will return a neatly packaged OAuth Token that you can use to make authenticated calls to the API. We also include the user who just authenticated for your convenience:

```json
{
    "access_token": "fb2e77d.47a0479900504cb3ab4a1f626d174d2d",
    "user": {
        "id": "1574083",
        "username": "snoopdogg",
        "full_name": "Snoop Dogg",
        "profile_picture": "http://distillery.s3.amazonaws.com/profiles/profile_1574083_75sq_1295469061.jpg"
    }
}
```

Note that we do not include an expiry time. Our access_tokens have no explicit expiry, though your app should handle the case that either the user revokes access or we expire the token after some period of time. In this case, your response’s meta will contain an “error_type=OAuthAccessTokenError”. In other words: do do not assume your access_token is valid forever.

##Client-Side (Implicit) Authentication

If you’re building an app that does not have a server component (a purely javascript app, for instance), you’ll notice that it’s impossible to complete step three above to receive your access_token without also having to ship your client secret. You should never ship your client secret onto devices you don’t control. Then how do you get an access_token? Well the smart folks in charge of the OAuth 2.0 spec anticipated this problem and created the Implicit Authentication Flow.

### Step One: Direct your user to our authorization URL

```
https://instagram.com/oauth/authorize/?client_id=CLIENT-ID&redirect_uri=REDIRECT-URI&response_type=token
```

At this point, we present the user with a login screen and then a confirmation screen where they approve your app’s access to their Instagram data. Note that unlike the explicit flow the response type here is “token”.

### Step Two: Receive the access_token via the URL fragment

Once the user has authenticated and then authorized your application, we’ll redirect them to your redirect_uri with the access_token in the url fragment. It’ll look like so:

```
http://your-redirect-uri#access_token=ACCESS-TOKEN
```

Simply grab the access_token off the URL fragment and you’re good to go. If the user chooses not to authorize your application, you’ll receive the same error response as in the explicit flow

## Scope (Permissions)

The OAuth 2.0 spec allows you to specify the scope of the access you’re requesting from the user. Currently, all apps have basic read access by default. If all you want to do is access data then you do not need to specify a scope (the “basic” scope will be granted automatically).

However, if you plan on asking for extended access such as liking, commenting, or managing friendships, you’ll have to specify these scopes in your authorization request. Here are the scopes we currently support:

* basic - to read any and all data related to a user (e.g. following/followed-by lists, photos, etc.) (granted by default)
* comments - to create or delete comments on a user’s behalf
* relationships - to follow and unfollow users on a user’s behalf
* likes - to like and unlike items on a user’s behalf

You should only request the scope you need at the time of authorization. If in the future you require additional scope, you may forward the user to the authorization URL with that additional scope to be granted. If you attempt to perform a request with an access token that isn’t authorized for that scope, you will receive an OAuthPermissionsException error return.

If you’d like to request multiple scopes at once, simply separate the scopes by a space. In the url, this equates to an escaped space (“+”). So if you’re requesting the likes and comments permission, the parameter will look like this:

```
scope=likes+comments
```

Note that an empty scope parameter (scope=) is invalid; you must either omit the scope, or specify a non-empty scope list.