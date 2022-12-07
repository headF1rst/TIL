---
title: GitHub Actions를 통해 CI/CD 구축하기
category:
thumbnail: https://miro.medium.com/max/1075/0*_NKWW9qcekBPRnJ0.png
tags: 프로젝트
date: 2022-12-06 10:00
---

저희 기프터즈팀은 성공적인 프로젝트를 위한 요건으로 빠른 사용자 피드백을 뽑았는데요. 그만큼 프로젝트의 배포 주기가 짧아지면서 빌드 및 배포를 하는 과정이 번거로워졌고, CI/CD 도입을 고안하였습니다.

이번 글에서는 저희가 CI/CD 도구 중 GitHub Actions를 사용하는 이유와 동작원리에 대해서 공유하겠습니다.

## 1. GitHub Actions의 장점

GitHub Actoins를 CI 솔루션으로 채택하게 된 이유는 다음과 같습니다.

- GitHub와 통일된 환경에서 CI 수행이 가능하다.
- 중앙에서 관리하는 `GitHub Actions Runner` 에 지속적으로 트러블슈팅하여 원활한 CI 환경 구성이 가능하다.
- 프로젝트마다 개별 Runner를 통한 빌드 테스트가 가능하다.
- 친숙한 문법의 YAML 파일로 파이프라인 구성이 간단하다.

- GitHub Actions Runner란?
    - GitHub Actions를 기동하는 Runner
    - GitHub는 퍼블릭 쪽의 GitHub Actions Runner를 클라우드에서 제공해 주고 있다.
        - 덕분에 직접 프로비저닝할 필요 없이 Runner를 바로 사용하는 것이 가능하다.

## 2. Github Action의 구성 요소

- workflow
    - 한개 이상의 `job` 을 실행할 수 있는 자동화된 작업
    - `YAML` 파일로 작성된다.
    - `event` 에 의해서 실행된다.
- event
    - `workflow` 를 실행시키는 특정 활동
    - 깃허브에서 발생하는 대부분의 작업을 event로 정의 가능.
        - ex) `push event` , `pull request event` , `issue event`
- jobs
    - 한가지 `runner` 안에서 실행되는 여러 `step` 들의 모음
    - 각 `step` 들은 일종의 `shell script` 처럼 실행된다.
    - step들은 순서에 따라 실행되며 step끼리 데이터 공유가 가능하다
    - job은 다른 job에 의존관계를 가질 수 있으며 `병렬 실행` 이 가능하다.
- actions
    - 반복 작업을 정의한 커스텀 어플리케이션
    - workflow 파일에서 자주 반복되는 코드를 미리 정의할 수 있다.
        - 코드 양을 줄이는 이점
    - 깃허브 마켓플레이스를 통해 다른 사람이 만든 action 사용 가능

더 자세한 GitHub Actions workflow syntax는 [해당 포스트](https://jinmay.github.io/2020/05/13/git/github-action-syntax/)를 참고하면 도움이 되실 것 같습니다.

![Untitled](https://i.imgur.com/9tu0sgH.png)

## 4. Github Action으로 CI/CD 파이프라인 구축하기

다음과 같은 순서로 파이프라인이 구동되도록 workflow를 작성해 보도록 하겠습니다.

1. Github Action이 트리거되면 jib로 이미지를 빌드한다.
2. 만들어진 이미지를 DockerHub에 push한다.
3. 서버에 접속해서 도커 이미지를 pull 한다.

`.github/workflows` 디렉토리를 프로젝트에 생성하고, 거기에 gradle 빌드를 위한 `build_backend.yml` 을 생성하였습니다.

### 4.1 build_backend.yml

다음 `jobs` 가 실제로 CI를 수행하는 과정이며 `steps` 단계로 jobs가 진행되게 됩니다.

```yaml
name: Build Backend Image

on: # github actions trigger 조건
  pull_request:
    branches:
      - production
      - master
    paths: # backend 폴더 아래의 파일들에 대해서 작업하고 PR 보낸 경우에만 trigger
      - "backend/**"
  workflow_dispatch: # 수동으로 github actions trigger 가능 조건

defaults:
  run:
    working-directory: backend

jobs:
  build:
    runs-on: ubuntu-latest # github action 스크립트가 작동할 OS 지정

    steps:
      - name: Checkout
        uses: actions/checkout@v3 # 프로젝트 코드를 checkout 한다

      - name: Set up JDK 1.8
        uses: actions/setup-java@v1 # action이 실행될 OS에 자바 설치
        with:
          java-version: 1.8
          distribution: 'temurin'

      - name: Login to Docker Hub
        uses: docker/login-action@v2.1.0 # 도커 허브로 이미지를 푸시하기 위해 자격정보 획득
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }} # 시크릿 환경 변수 사용
          password: ${{ secrets.DOCKERHUB_PASSWORD }}

      - name: Grant execute permission for gradlew
        run: chmod +x ./gradlew # graldle wrapper를 실행할 수 있는 실행 권한(+x)
        shell: bash

      - name: Build with jib # gradle wrapper를 통해 도커 이미지 빌드
        run: |
          ./gradlew jib \
          -Djib.to.image="text-me-docker"

      - name: Docker push
        run: docker push ${{ secrets.DOCKERHUB_USERNAME }}/text-me-docker-repo:tagname

      - name: Get current time
        uses: 1466587594/get-current-time@v2
        id: current-time
        with:
          format: YYYY-MM-DDTHH-mm-ss
          utcOffset: "+09:00" # action의 기준이 UTC이므로 KST를 맞추기 위해 +9시간이 필요

      - name: Show Current Time
        run: echo "CurrentTime=${{steps.current-time.outputs.formattedTime}}" # get-current-time에서 지정한 포맷대로 현재 시간을 노출
        shell: bash
```

빌드 스크립트에 작성된 내용을 좀 더 자세히 살펴보겠습니다.

- `jobs: build: runs-on: ubuntu-latest`
    - 작성한 스크립트가 작동될 OS 환경을 지정합니다.
    
    ![Untitled](https://i.imgur.com/mRZU1aq.png)
    
- `steps: uses`
    - 마켓 플레이스에 사전 정의된 내용을 이용하여 step을 수행합니다.
    - 사전 작업을 위한 환경 설정용.
        
        ![스크린샷 2022-12-04 오후 11.47.07.png](https://i.imgur.com/xZ8nmau.png)
        

- `steps: run`
    - 개발자가 직접 정의한 커맨드를 수행합니다.
    - 실제 수행용.

- `steps: run | ./gradlew jib \ -Djib.to.image="text-me-docker"`
    - Jib를 통해 “text-me-docker”라는 이름의 이미지를 빌드 합니다.

### 4.1.1 Dockerfile

도커 파일 프로젝트 루트에 Dockerfile이라는 이름으로 파일을 생성해 주었습니다.

```makefile
FROM openjdk:17-jdk
ARG JAR_FILE="build/libs/*.jar"
COPY ${JAR_FILE} text-me.jar
ENTRYPOINT ["java","-jar","/text-me.jar"]
```

위의 빌드 스크립트를 통해서 jar 파일을 바탕으로 `text-me-docker` 라는 이름의 도커 이미지를 만들었습니다.

그 다음 생성된 이미지를 docker hub에 푸시하도록 스크립트를 작성하였습니다.

### 4.2 deploy-backend

이제 운영 서버에서 도커 허브에 올린 이미지를 pull한 다음, 실행시켜 주면 됩니다.

 docker 관련 명령어를 사용하기 위해서 [운영 서버에 docker를 설치](https://headf1rst.github.io/TIL/infra-1)해 주었습니다.

docker가 운영 서버에 정상적으로 설치되었다면, 이미지를 가져와서 실행시키는 스크립트를 작성하여 배포를 자동화 시켜 보도록 하겠습니다.

```yaml
name: Deploy Backend

on:
  push:
    branches:
      - production

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v2

      - name: Set up JDK 1.8
        uses: actions/setup-java@v1
        with:
          java-version: 1.8
          distribution: 'temurin'

      - name: SSH setting
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USER_NAME }}
          key: ${{ secrets.PRIVATE_KEY }}
          envs: GITHUB_SHA
          scrips: |
            docker pull ${{ secrets.DOCKERHUB_USERNAME }}/text-me-docker-repo:tagname
            docker tag ${{ secrets.DOCKERHUB_USERNAME }}/text-me-docker-repo:tagname
            docker stop server
            docker run -d --rm --name server -p 80:8080 text-me-docker
```

배포 스크립트에서 눈여겨 볼 부분은 원격 서버에 접근하기 위한 SSH setting 부분입니다. ([ssh-action](https://github.com/appleboy/ssh-action)) 

로컬 서버를 열고 터미널에 다음 명령어를 입력하여 ssh 키를 생성해 주었습니다.

- `ssh-keygen -t rsa -b 4096 -C "내이메일@gmail.com"`

![스크린샷 2022-12-07 오전 1.15.51.png](https://i.imgur.com/s7q725G.png)

ssh 키를 `./authorized_keys2` 경로에 저장하고 다음 명령어를 통해서 ssh 키값을 확인해 줍니다.

- `vim ./ssh/authorized_keys2.pub`

ssh 키를 GITHUB SECRET의 PRIVATE_KEY로 등록해주었습니다.

![스크린샷 2022-12-07 오후 1.37.08.png](https://i.imgur.com/wJ7mdpG.png)

모든 과정이 마무리되었다면 직접 docker hub에 접속해서 이미지를 pull 받아올 필요 없이 자동으로 이미지를 가져와서 운영 서버에 띄워주게됩니다.

## 마치며

지금까지 기프터즈팀이 GitHub Actions를 사용하는 이유와 동작원리에 대해 설명드렸습니다.

시간이 된다면 프론트 빌드 및 배포 과정도 포스팅 해보도록 하겠습니다. 감사합니다.

---

**참고 자료** 📚

- [GitHub Action으로 CI/CD 구축하기](https://velog.io/@sgwon1996/GitHub-Action%EC%9C%BC%EB%A1%9C-CICD-%EA%B5%AC%EC%B6%95%ED%95%98%EA%B8%B0)

- [카카오엔터프라이즈가 GitHub Actions를 사용하는 이유](https://tech.kakao.com/2022/05/06/github-actions/)

- [Github actions를 이용한 CICD - 2](https://itcoin.tistory.com/685)

- [[Github]깃허브의 CI툴인 Actions의 문법 간단 정리](https://jinmay.github.io/2020/05/13/git/github-action-syntax/)

- [쿠버네티스 환경에 스프링 어플리케이션 배포하기](https://velog.io/@sgwon1996/%EC%BF%A0%EB%B2%84%EB%84%A4%ED%8B%B0%EC%8A%A4-%ED%99%98%EA%B2%BD%EC%97%90-%EC%8A%A4%ED%94%84%EB%A7%81-%EC%96%B4%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98-%EB%B0%B0%ED%8F%AC%ED%95%98%EA%B8%B0)
