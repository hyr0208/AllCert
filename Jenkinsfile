pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'allcert'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    sh 'docker build -t ${DOCKER_IMAGE}:latest .'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Stop existing container
                    sh 'docker stop allcert || true'
                    sh 'docker rm allcert || true'
                    
                    // Run new container (without custom network)
                    sh '''
                        docker run -d \
                            --name allcert \
                            --restart unless-stopped \
                            -p 3002:80 \
                            ${DOCKER_IMAGE}:latest
                    '''
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    // Remove dangling images
                    sh 'docker image prune -f'
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ AllCert 배포 성공! https://allcert.yyyerin.co.kr'
        }
        failure {
            echo '❌ 배포 실패'
        }
    }
}
