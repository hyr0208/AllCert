pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE = 'allcert'
        VITE_SUPABASE_URL = 'https://sufdhcqeqsggecmatreg.supabase.co'
        VITE_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1ZmRoY3FlcXNnZ2VjbWF0cmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDMxNzAsImV4cCI6MjA4NjMxOTE3MH0.RBdPAzYYB6N5o0ff283DYS7mfPAatmGnb8wHaxS6PHY'
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
                    sh '''
                        docker build \
                            --build-arg VITE_SUPABASE_URL=$VITE_SUPABASE_URL \
                            --build-arg VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY \
                            -t ${DOCKER_IMAGE}:latest .
                    '''
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
