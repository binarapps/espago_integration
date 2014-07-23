# encoding: utf-8
class PaymentsController < ApplicationController
  def index
  end

  def charge_customer
    if params[:card_token]
      request = Espago.clients(:post, card: params[:card_token], description: "New client" ).body
      puts "Creating client"
      puts request
      charge = {amount: 100.0, description: "Description", currency: 'pln', client: request["id"]}
      puts "Charging client"
      response = Espago.charges(:post, charge)      
      puts response.body
      redirect_to root_url
    else
      redirect_to root_url
    end
  end
end