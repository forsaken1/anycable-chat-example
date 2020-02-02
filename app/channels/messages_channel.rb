class MessagesChannel < ApplicationCable::Channel
  def subscribed
    stream_from ChatsHelper.name(current_user.id, params[:user_id])
  end

  def unsubscribed
  end
end
