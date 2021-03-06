# Personal Chats Rails Anycable React.js Example

## Reference

You can see, how it works on Phoenix (Elixir) here: https://github.com/forsaken1/phoenix-chats-example

## Installation

* `bundle install`

* `bundle exec rake db:create db:migrate db:seed`

* `brew install anycable-go`

## Run

* `redis server`

* `bundle exec anycable`

* `anycable-go --host=localhost --port=3334`

* `bundle exec rails s`

## Infrastructure

from: https://evilmartians.com/chronicles/anycable-actioncable-on-steroids

1. AnyCable WebSocket server provides low-level connections (sockets) management, subscriptions management and broadcasting messages to clients.
2. Anycable RPC server is a connector between Rails application and WebSocket server. This server is a part of the anycable gem.
3. Redis pub/sub used for sending messages from the application to the WS server, which then broadcasts the messages to clients.

```
[React app] <-> [Rails app] (default port 3000)>-------------------------
     ^                                                                  |
     |          [Anycable RPC server] (default port 50051)           [Redis] (default port 6379)
     |               |                                                  |
     ---------< [Websocket server] (default port 3334)<------------------
```

## Details

1. Define Channel on the server. `ChatsHelper.name` returns string with unique channel name, for example, "chat-1-2" - chat between users with ids: 1 and 2 [link](https://github.com/forsaken1/anycable-chat-example/blob/master/app/channels/messages_channel.rb)

```ruby
class MessagesChannel < ApplicationCable::Channel
  def subscribed
    stream_from ChatsHelper.name(current_user.id, params[:user_id])
  end

  def unsubscribed
  end
end
```

2. Set up connection with MessageChannel on the client for each user conversation, where `user_id` will pass to the MessageChannel as `params[:user_id]` [link](https://github.com/forsaken1/anycable-chat-example/blob/master/app/javascript/components/Chats.js#L93)

```es6
{users.map((user, i) =>
  <ActionCable
    key={i}
    channel={{ channel: 'MessagesChannel', user_id: user.id }}
    onReceived={response => this.handleReceivedConversation(user.id, response)}/>)}
```

3. Send a message to channel when message created [link](https://github.com/forsaken1/anycable-chat-example/blob/master/app/controllers/messages_controller.rb#L14)

```ruby
def create
  message = Message.new message_params

  if message.save
    ActionCable.server.broadcast ChatsHelper.name(current_user.id, message_params[:user_to_id]), message.attributes
    render json: message
  else
    render json: { errors: message.errors.messages }
  end
end
```

4. You should define handler which will listen channel on the client and process a data from server [link](https://github.com/forsaken1/anycable-chat-example/blob/master/app/javascript/components/Chats.js#L54)

```es6
handleReceivedConversation = (userId, response) => {
  const { conversations } = this.state;
  const messages = conversations[userId] ? conversations[userId] : [];
  
  this.setState({conversations: {...conversations, [userId]: [...messages, response]}}, this.scrollDown);
}
```

## Production server configuration 

1. `/etc/systemd/system/anycable-go.service`:

```
[Unit]
Description=Production AnyCable Go WebSocket Server
After=syslog.target network.target

[Service]
Type=simple
ExecStart=/usr/local/bin/anycable-go --port=8080 --rpc_host=localhost:50051 --redis_channel=__anycable_production__
ExecStop=/bin/kill -TERM $MAINPID

# User=xxx
# Group=xxx
UMask=0002
LimitNOFILE=16384 # increase open files limit (see OS Tuning guide)

Restart=on-failure

[Install]
WantedBy=multi-user.target
```

and run it: `sudo systemctl start anycable-go`

status: `sudo systemctl status anycable-go`

logs: `sudo journalctl -u anycable-go --since today`

2. `/etc/systemd/system/anycable-rpc.service`:

```
[Unit]
Description=Production AnyCable gRPC Server
After=syslog.target network.target

[Service]
Type=simple
Environment=RAILS_ENV=production
WorkingDirectory=/project/path/current/
ExecStart=/bin/bash -lc 'bundle exec anycable --rpc-host=localhost:50051 --redis-channel=__anycable_production__'
# or try use:
# ExecStart=/home/balloon/.rbenv/bin/rbenv exec bundle exec anycable --rpc-host=localhost:50051 --redis-channel=__anycable_production__
ExecStop=/bin/kill -TERM $MAINPID

# Set user/group
User=your_user
# Group=www
# UMask=0002

# Set memory limits
MemoryHigh=1G
MemoryMax=1G
# MemoryAccounting=true

Restart=on-failure

[Install]
WantedBy=multi-user.target
```

3. nginx

```
server {

  ...

  location /anycable {
    proxy_pass http://127.0.0.1:8080/cable;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
  }
  
  ...
```

4. config/anycable.yml

```
default: &default
  rpc_host: "localhost:50051"
  log_grpc: false
  log_file: nil
  debug: false
  log_level: info
  redis_channel: "__anycable__"
  redis_url: "redis://localhost:6379"
  redis_sentinels: []

development:
  <<: *default

test:
  <<: *default

staging:
  <<: *default
  rpc_host: "localhost:50052"
  redis_channel: "__anycable_staging__"

production:
  <<: *default
  rpc_host: "localhost:50051"
  redis_channel: "__anycable_production__"
```

5. config/cable.yml

```
development:
  adapter: any_cable

test:
  adapter: async

staging:
  adapter: any_cable
  url: <%= ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" } %>
  channel_prefix: anycable_staging

production:
  adapter: any_cable
  url: <%= ENV.fetch("REDIS_URL") { "redis://localhost:6379/1" } %>
  channel_prefix: anycable_production
```

## Links

* https://docs.anycable.io/#/ruby/rails
* https://evilmartians.com/chronicles/anycable-actioncable-on-steroids
* https://medium.com/@dakota.lillie/using-action-cable-with-react-c37df065f296
* http://laithazer.com/blog/2017/03/25/rails-actioncable-stream-for-vs-stream-from/
* http://rusrails.ru/action-cable-overview
