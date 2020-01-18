Rails.application.routes.draw do
  devise_for :users
  resources :users, only: [:index]
  root 'application#home'
end
