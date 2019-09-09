pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '7'))
    }

    parameters {
        string(name: 'STM_BRANCH', defaultValue: 'stmlol', description: 'Branch som skal deployes til STM')
        string(name: 'UTV_BRANCH', defaultValue: 'masterlol', description: 'Branch som skal deployes til UTV')
    }

    environment {
        HTTPS_PROXY="http://proxy.vegvesen.no:8080"
        HTTP_PROXY="http://proxy.vegvesen.no:8080"
        https_proxy="http://proxy.vegvesen.no:8080"
        http_proxy="http://proxy.vegvesen.no:8080"
    }

    stages {
        stage ('Build') {
            when { anyOf { branch 'masterlol'; branch 'V3_STMlol' } }
            steps {
                sh './gradlew clean build '
            }
        }

        stage ('Deploy') {
            when {
                anyOf {
                    branch "${params.STM_BRANCH}"
                    branch "${params.UTV_BRANCH}"
                }
            }
            environment {
                TOMCAT = credentials('Les-Tomcat-credentials')
                NO_PROXY = 'svvuvegkartw01,svvuvegkartw02,svvunvdbapil01,svvunvdbapil02'
            }
            steps {
                script {
                     echo "Branch: ${BRANCH_NAME}"
                     def target = "${BRANCH_NAME}" == "${params.STM_BRANCH}" ? 'svvuvegkartw' : 'svvunvdbapil'
                     echo "Target: ${target}"
                     env.target = target
                     def path = "/nvdb/visrute"
                     echo "Path: ${path}"
                     env.deployPath = path

                     sh '''
                        curl --user ${TOMCAT_USR}:${TOMCAT_PSW} "http://${target}01:15140/manager/text/undeploy?path=${deployPath}"
                        curl --user ${TOMCAT_USR}:${TOMCAT_PSW} "http://${target}02:15140/manager/text/undeploy?path=${deployPath}"

                        OUTPUT=`find build/libs/visrute*.war -exec curl --upload {} --user ${TOMCAT_USR}:${TOMCAT_PSW} "http://${target}01:15140/manager/text/deploy?path=${deployPath}" \\;`
                        if [[ $OUTPUT != *"OK - Deployed application"* ]]; then
                          exit 1
                        fi
                        OUTPUT=`find build/libs/visrute*.war -exec curl --upload {} --user ${TOMCAT_USR}:${TOMCAT_PSW} "http://${target}02:15140/manager/text/deploy?path=${deployPath}" \\;`
                        if [[ $OUTPUT != *"OK - Deployed application"* ]]; then
                          exit 1
                        fi
                     '''
                 }
            }
        }
    }
    post {
        success {
            hipchatSend(color: 'GREEN',
            message: 'OK')
        }
        failure {
            hipchatSend(color: 'RED',
            message: 'FAIL')
        }
    }
}
