# Chats Rails Anycable Example

## Installation

* `bundle install`

* `bundle exec rake db:create db:migrate db:seed`

* `brew install anycable-go`

## Run

* `redis server`

* `bundle exec anycable`

* `anycable-go --host=localhost --port=3334`

* `bundle exec rails s`

## Details

1. Define Channel on the server. `ChatsHelper.name` returns string with unique channel name, for example, "chat-1-2" - chat between users with ids: 1 and 2

```ruby
class MessagesChannel < ApplicationCable::Channel
  def subscribed
    stream_from ChatsHelper.name(current_user.id, params[:user_id])
  end

  def unsubscribed
  end
end
```

2. Set up connection with MessageChannel on the client for each user conversation, where `user_id` will pass to the MessageChannel as `params[:user_id]`

```es6
{users.map((user, i) =>
  <ActionCable
    key={i}
    channel={{ channel: 'MessagesChannel', user_id: user.id }}
    onReceived={response => this.handleReceivedConversation(user.id, response)}/>)}
```

3. Send a message to channel when message created. 

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

4. You should define handler which will listen channel on the client and process a data from server

```es6
handleReceivedConversation = (userId, response) => {
  const { conversations } = this.state;
  const messages = conversations[userId] ? conversations[userId] : [];
  
  this.setState({conversations: {...conversations, [userId]: [...messages, response]}}, this.scrollDown);
}
```
