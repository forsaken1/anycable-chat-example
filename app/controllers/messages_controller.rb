class MessagesController < ApplicationController
  skip_before_action :verify_authenticity_token, only: [:create]

  def index
    messages = Message.all
    messages = messages.where(user_from_id: params[:user_from_id]) if params[:user_from_id]
    messages = messages.or(Message.where(user_to_id: params[:user_to_id])) if params[:user_to_id]
    render json: messages
  end

  def create
    message = Message.new message_params

    if message.save
      ActionCable.server.broadcast 'chat', message.attributes
      render json: message
    else
      render json: { errors: message.errors.messages }
    end
  end

  private

  def message_params
    params.require(:user_from_id)
    params.require(:user_to_id)
    params.require(:text)
    params.permit(:user_from_id, :user_to_id, :text)
  end
end
