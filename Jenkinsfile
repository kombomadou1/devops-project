pipeline {
    agent {
        kubernetes {
           inheritFrom 'devops-template'
        }
    }

    environment {
        DOCKER_IMAGE = 'kombomadou/back-ges-asso'
        IMAGE_TAG = "build-${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
        	agent controller
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                container('node') {
                    dir('app/backend') {
                        sh 'npm ci'
                    }
                }
            }
        }

        stage('Tests') {
            steps {
                container('node') {
                    dir('app/backend') {
                        sh 'npm test -- --runInBand'
                    }
                }
            }
        }

        stage('Build NestJS') {
            steps {
                container('node') {
                    dir('app/backend') {
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Build and push image') {
            steps {
                container('kaniko') {
                    sh """
                        /kaniko/executor \\
                          --context=\${WORKSPACE}/app/backend \\
                          --dockerfile=\${WORKSPACE}/app/backend/Dockerfile \\
                          --destination=\${DOCKER_IMAGE}:\${IMAGE_TAG}
                    """
                }
            }
        }

        stage('Deploy') {
            container("kubectl"){
                steps {
                    withKubeConfig([credentialsId: 'k3s-kubeconfig']) {
                        sh """
                            kubectl apply -f k8s/app/back-asso-deploy.yaml
                            kubectl apply -f k8s/app/back-asso-deploy.yaml
                            kubectl rollout status deployment/back-ges-asso
                        """
                    }
                }
            }
        }
    }
}