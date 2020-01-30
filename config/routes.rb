Rails.application.routes.draw do
  devise_for :users
  resources :users, only: [:index]
  resources :messages, only: [:index, :create]
  root 'application#home'
  # mount ActionCable.server => '/cable'
end
