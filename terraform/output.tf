# Show the public IP address of the SpendWise EC2 server
output "ec2_public_ip" {

  # Description shown by Terraform
  description = "Public IP address of the SpendWise EC2 server"

  # Get the public IP from the EC2 instance
  value = aws_instance.spendwise_server.public_ip
}