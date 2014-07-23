Rails.application.routes.draw do
  root 'payments#index'
  post 'charge_customer' => 'payments#charge_customer', as: :charge_customer
end
