pipeline {
    agent {
        kubernetes {
           inheritFrom 'devops-template'
        }
    }

    environment {
        DOCKER_IMAGE = 'kombomadou/back-ges-asso'
        IMAGE_TAG = "build-${BUILD_NUMBER}"
        APP_NAMESPACE = 'ges-asso'
    }

    stages {
        stage('Checkout') {
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
            steps {
                container("kubectl"){
                    withKubeConfig([credentialsId: 'k3s-credentials']) {
                        sh """
                            kubectl -n ${APP_NAMESPACE} apply -f k8s/app/back-asso-deploy.yaml 
                            kubectl -n ${APP_NAMESPACE} apply -f k8s/app/back-asso-service.yaml 

                            kubectl -n ${APP_NAMESPACE} set image deployment/back-ges-asso back-ges-asso=${BACKEND_IMAGE}:${IMAGE_TAG}
                            kubectl -n ${APP_NAMESPACE} rollout status deployment/back-ges-asso --timeout=180s
                        """
                    }
                }
            }
        }
    }
}