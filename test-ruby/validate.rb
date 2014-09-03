require 'rubygems'
require 'digest/sha1'
require 'rest_client'


rest_url = 'http://localhost:3000/'

puts "appID? "
appID = gets
appID.chomp!


response = RestClient.post rest_url + 'api/validate',
  {:phoneID => appID}.to_json,
  :content_type => :json, :accept => :json

puts JSON.parse(response)
