require 'rubygems'
require 'rest_client'


rest_url = 'http://localhost:3000/'


puts "Username?"
username = gets
username.chomp!

puts "pin? "
pin = gets
pin.chomp!

puts "The product provider ?"
target = gets
target.chomp!

puts "Wallet type to use (1/2)? "
type = gets
type.chomp!

puts "Amount to pay ($)? "
amount = gets
amount.chomp!

response = RestClient.get rest_url + 'api/createsession'

response = JSON.parse(response)
sessionid = response["sessionid"]
puts sessionid


result = username.downcase + pin
result = Digest::SHA1.hexdigest(result).downcase
result = sessionid + result
hashpin = Digest::SHA1.hexdigest(result).upcase
puts hashpin

response = RestClient.post rest_url + 'api/login2',
  {:sessionid => sessionid, :initiator =>  username , :pin => hashpin }.to_json,
  :content_type => :json, :accept => :json


response = RestClient.post rest_url + 'api/transfer',
  {:sessionid => sessionid, :to => target , :amount => amount ,:type => 1 }.to_json,
  :content_type => :json, :accept => :json

response = RestClient.post rest_url + 'api/balance',
  {:sessionid => sessionid, :type => 1  }.to_json,
  :content_type => :json, :accept => :json

puts JSON.parse(response)
