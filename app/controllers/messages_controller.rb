class MessagesController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create]

  def index
    messages = Message.all
    if params[:user_id]
      messages = messages
                  .where(user_from_id: params[:user_id], user_to: current_user)
                  .or(Message.where(user_to_id: params[:user_id], user_from: current_user))
    end
    render json: messages.order(:created_at)
  end

  def create
    message = Message.new message_params

    if message.save
      ActionCable.server.broadcast ChatsHelper.name(current_user.id, message_params[:user_to_id]), message.attributes
      render json: message
    else
      render json: { errors: message.errors.messages }
    end
  end

  private

  def message_params
    params.require(:user_id)
    params.require(:text)
    params
      .permit(:text)
      .merge(user_from_id: current_user.id)
      .merge(user_to_id: params[:user_id])
  end
end
