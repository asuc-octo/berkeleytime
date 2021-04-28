# this init relates to 'statuspage' VM in GCP, for status.berkeleytime.com
# gcloud compute ssh root@statuspage
curl -s https://deb.nodesource.com/setup_16.x | bash -| bash -
apt install -y nodejs
git clone https://github.com/asuc-octo/berkeleytime.git
npm run start --prefix berkeleytime/statuspage
