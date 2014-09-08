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

response = RestClient.post rest_url + 'api/login',
  {:initiator =>  username , :pin => pin }.to_json,
  :content_type => :json, :accept => :json

puts JSON.parse(response)
