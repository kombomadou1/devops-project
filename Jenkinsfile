pipeline {
    agent {
        kubernetes {
           inheritFrom 'devops-template'
        }
    }

    environment {
        BACKEND_IMAGE = 'kombomadou/back-ges-asso'
        FRONTEND_IMAGE = 'kombomadou/front-ges-asso'
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
            parallel{
                stage("Backend"){
                    steps {
                        container('node') {
                            dir('app/backend') {
                                sh 'npm ci'
                            }
                        }
                    }
                }

                stage("Frontend"){
                    steps {
                        container('node') {
                            dir('app/frontend') {
                                sh 'npm ci'
                            }
                        }
                    }
                }
            }
        }

        stage("Tests"){
            parallel{
                stage('Backend') {
                    steps {
                        container('node') {
                            dir('app/backend') {
                                sh 'npm test -- --runInBand'
                            }
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        container('node') {
                            dir('app/frontend') {
                                sh 'npm test -- --runInBand'
                            }
                        }
                    }
                }
            }
        }
        

        stage("Build"){
            parallel{
                stage('Backend') {
                    steps {
                        container('node') {
                            dir('app/backend') {
                                sh 'npm run build'
                            }
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        container('node') {
                            dir('app/frontend') {
                                sh 'npm run build'
                            }
                        }
                    }
                }
            }
        }


        stage("Build and push image"){
            parallel{
                stage('Backend') {
                    steps {
                        container('kaniko') {
                            sh """
                                /kaniko/executor \\
                                  --context=\${WORKSPACE}/app/backend \\
                                  --dockerfile=\${WORKSPACE}/app/backend/Dockerfile \\
                                  --destination=\${BACKEND_IMAGE}:\${IMAGE_TAG}
                            """
                        }
                    }
                }

                stage('Frontend') {
                    steps {
                        container('kaniko') {
                            sh """
                                /kaniko/executor \\
                                  --context=\${WORKSPACE}/app/frontend \\
                                  --dockerfile=\${WORKSPACE}/app/frontend/Dockerfile \\
                                  --destination=\${FRONTEND_IMAGE}:\${IMAGE_TAG}
                            """
                        }
                    }
                }
            }
        }

        stage("Deploy"){
            parallel{
                stage('Backend') {
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

                stage('Frontend') {
                    steps {
                        container("kubectl"){
                            withKubeConfig([credentialsId: 'k3s-credentials']) {
                                sh """
                                    kubectl -n ${APP_NAMESPACE} apply -f k8s/app/front-asso-deploy.yaml 
                                    kubectl -n ${APP_NAMESPACE} apply -f k8s/app/front-asso-service.yaml 

                                    kubectl -n ${APP_NAMESPACE} set image deployment/front-ges-asso front-ges-asso=${FRONTEND_IMAGE}:${IMAGE_TAG}
                                    kubectl -n ${APP_NAMESPACE} rollout status deployment/front-ges-asso --timeout=180s
                                """
                            }
                        }
                    }
                }
            }
        }
    }
}