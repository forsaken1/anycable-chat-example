class ChatsHelper
  def self.name first_user_id, second_user_id
    user_ids = [first_user_id, second_user_id].sort
    "chat-#{user_ids.first}-#{user_ids.last}"
  end
end
