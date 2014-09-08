require 'rubygems'
require 'rest_client'

rest_url = 'http://localhost:3000/'

puts "Agent to register? "
agent = gets
agent.chomp!

puts "PIN? "
pin = gets
pin.chomp!

puts "name? "
name = gets
name.chomp!

puts "company?"
company = gets
company.chomp!

puts "email address? "
email = gets
email.chomp!

puts "phoneID? "
phoneID = gets
phoneID.chomp!

puts "appID? "
appID = gets
appID.chomp!


response = RestClient.post rest_url + 'api/register',
  {:agent => agent , :new_pin => pin , :name => name , :company => company , :email_address  => email , :phoneID => phoneID , :appID => appID }.to_json,
  :content_type => :json, :accept => :json

puts JSON.parse(response)
