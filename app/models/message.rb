class Message < ApplicationRecord
  belongs_to :user_from, class_name: 'User'
  belongs_to :user_to, class_name: 'User'
end
