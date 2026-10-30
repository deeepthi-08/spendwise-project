
# --------------------------------------------------
# 1. CREATE A SECURITY GROUP (FIREWALL)
# --------------------------------------------------

resource "aws_security_group" "spendwise_sg" {

  # Name of the firewall in AWS
  name = "spendwise-sg"

  # Allow SSH access only from your own public IP
  # Port 22 is used to connect to the EC2 server
  ingress {
    description = "Allow SSH access from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_allowed_cidr]
  }

  # Allow HTTP traffic from everyone
  # Port 80 is used for normal website traffic
  ingress {
    description = "Allow HTTP traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow the EC2 server to make outgoing connections
  egress {
    description = "Allow all outgoing traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}


# --------------------------------------------------
# 2. CREATE THE EC2 INSTANCE (VIRTUAL SERVER)
# --------------------------------------------------

resource "aws_instance" "spendwise_server" {

  # Size of the EC2 server
  instance_type = var.instance_type

  # Operating system image (Ubuntu)
  ami = var.ami_id

  # Key pair used for SSH access
  key_name = var.key_name

  # Attach our security group to the server
  vpc_security_group_ids = [aws_security_group.spendwise_sg.id]

  # Name displayed in the AWS Console
  tags = {
    Name = "SpendWise-Server"
  }
}
