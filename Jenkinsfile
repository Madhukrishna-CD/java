pipeline {
    agent any
    stages {
        stage('Git clone') {
            steps {
                git branch: 'main', credentialsId: '43432bb3-1c1f-46e0-aacc-d3fa6a69d9b8', url: 'https://github.com/Madhukrishna-CD/sample.git'
            }
        }
        stage('Test') {
            steps {
                echo "Testing completed"
                }
        }
        stage('Build') {
            steps {
                echo "Build completed"
                }
        }
    }
}
