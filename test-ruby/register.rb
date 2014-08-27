require 'rubygems'
require 'digest/sha1'
require 'rest_client'


rest_url = 'http://localhost:3000/'

puts "Username? "
username = gets
username.chomp!

puts "PIN? "
pin = gets
pin.chomp!

puts "Agent to register? "
agent = gets
agent.chomp!


puts "name? "
name = gets
name.chomp!

puts "email address? "
email = gets
email.chomp!

puts "phoneID? "
phoneID = gets
phoneID.chomp!

puts "appID? "
appID = gets
appID.chomp!

response = RestClient.get rest_url + 'api/createsession'

response = JSON.parse(response)
sessionid = response["sessionid"]
puts sessionid


result = username.downcase + pin
result = Digest::SHA1.hexdigest(result).downcase
result = sessionid + result
hashpin = Digest::SHA1.hexdigest(result).upcase
puts hashpin

response = RestClient.post rest_url + 'api/login',
  {:sessionid => sessionid, :initiator =>  username , :pin => hashpin }.to_json,
  :content_type => :json, :accept => :json

response = RestClient.post rest_url + 'api/register',
  {:sessionid => sessionid, :agent => agent , :new_pin => pin , :name => name , :email_address  => email , :phoneID => phoneID , :appID => appID }.to_json,
  :content_type => :json, :accept => :json

response = RestClient.post rest_url + 'api/resetpin',
  {:sessionid => sessionid, :new_pin => pin ,  :agent => agent ,:suppress_pin_expiry => true }.to_json,
  :content_type => :json, :accept => :json

puts JSON.parse(response)
