variable "aws_region" {
  description = "AWS region where SpendWise infrastructure will be created"
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type for the SpendWise server"
  type        = string
  default     = "t3.micro"
}

variable "ami_id" {
  description = "AMI ID for the SpendWise EC2 server"
  type        = string
}

variable "key_name" {
  description = "AWS key pair name used to connect to the EC2 server"
  type        = string
}

variable "ssh_allowed_cidr" {
  description = "Your public IP address allowed to connect through SSH"
  type        = string
}