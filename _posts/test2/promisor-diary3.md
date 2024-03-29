---
title: Nginx 리버스 프록시 적용하여 Tomcat과 연동하기
category:
thumbnail: https://sysopszone.files.wordpress.com/2017/09/loadbalancer.jpeg?w=676
tags: 프로젝트
date: 2022-06-03 10:00
---

이번 스프린트에서는 Nginx를 설치하고 리버스 프록시를 적용하여 스프링 부트의 내장 톰캣에 연동하는 작업을 하게 되었는데, 이 과정을 글로 남겨 공유하고자 합니다.

웹 서버는 정적 리소스를 처리하고, WAS는 애플리케이션 로직만을 처리하던 과거와 달리, 현재는 둘 다 정적 리소스, 애플리케이션 로직 모두 처리가 가능합니다. 스프링부트는 톰캣을 내장하고 있기 때문에 그동안 별도의 WAS 설정이나 웹 서버를 구축하지 않아도 잘 동작해 왔습니다.

그렇다면 왜 굳이 웹 서버를 WAS 앞단에 설치해주려는 걸까요?

다양한 이유가 있지만 가장 큰 이유는 다음과 같습니다.

- WAS 과부하 방지 및 오류 화면 제공
- 로드 밸런싱을 통한 Scale-Out과 무중단 배포

## WAS 과부하 방지 및 오류 화면 제공

WAS만으로 웹 시스템을 구성하는 경우에 WAS가 너무 많은 역할을 담당하게 되고 서버 과부하가 발생할 우려가 있습니다.

또한 가장 비싼 애플리케이션 로직이 정적 리소스 때문에 수행에 어려움을 겪을 수도 있으며 WAS 장애시 오류 화면 노출도 불가능하다는 문제가 있습니다.

![스크린샷 2022-03-29 오전 11.33.32.png](https://i.imgur.com/UyIFlXB.jpg)

이러한 이유에서 웹 서버인 Nginx를 설치하여 정적 리소스는 웹 서버가 처리하고 WAS는 애플리케이션 로직 처리를 전담할 수 있도록 설계하였습니다.

이렇게 하면 정적 리소스만 제공하는 웹 서버는 잘 죽지 않고 WAS는 잘 죽기 때문에 WAS, DB 장애시 웹 서버가 오류화면을 제공하는 것이 가능하게 됩니다.

## 로드 밸런싱을 통한 Scale-Out과 무중단 배포

이용자 수가 증가하고 서비스의 규모가 커지면 기존의 서버만으로는 트래픽을 감당하는 게 불가능하게 되고, 두 가지 방법을 통해서 트래픽 문제를 해결하게 됩니다.

1. Scale-Up: 기존 서버의 성능을 확장하는 방식
2. Scale-Out: 기존의 서버와 동일하거나 낮은 성능의 서버를 여러대 증설하는 방식

만약 **Scale-Out 방식**으로 서버를 증설하였다면 트래픽을 균등하게 분배해주기 위한 `로드 밸런싱` 기법이 필요한데, 웹 서버가 바로 이 로드 밸런싱을 수행하고 여러 WAS에 트래픽을 균등하게 분배해주는 역할을 하게 됩니다. (다양한 로드 밸런싱 알고리즘이 궁금하다면 다음 [링크](https://tecoble.techcourse.co.kr/post/2021-11-07-load-balancing/)를 참고해주세요)

웹 서버를 로드밸런서로 사용하면 운영 중인 서비스를 중단하지 않고 신규 소프트웨어를 배포하는 **무중단 배포**가 가능합니다.

무중단 배포 기법에는 **Rolling, Blue-Green, Canary** 등이 있는데  `Blue-Green` 배포 방식의 경우, 운영 환경에 구버전과 신버전의 WAS 인스턴스를 구성한 후, 로드밸런서를 통해 신버전으로 모든 트래픽을 전환하는 배포 방식입니다.

![스크린샷 2022-09-25 오후 1.35.58.png](https://i.imgur.com/nJo3mSB.png)
<small>이미지 출처: [https://www.samsungsds.com/kr/insights/1256264_4627.html](https://www.samsungsds.com/kr/insights/1256264_4627.html)</small>

Blue-Green 배포 방식의 장단점에 대해 간략하게 알아보자면 다음과 같습니다.

- **장점**
    - 실제 서비스 환경에서 신버전을 미리 테스트 할 수 있다
    - 빠른 롤백이 가능하다
    - 배포 후 남아 있는 기존 버전의 환경을 다음 배포에 재사용 할 수 있다.
- **단점**
    - 시스템 자원이 두 배로 필요하다
    - 새로운 환경에 대한 테스트가 전제되어야 한다.

## 웹 서버를 사용한다면 Nginx? Apache?

위와 같은 이유에서 웹 서버를 설치하기로 결정하였고 어떤 웹 서버를 사용하는 게 프로젝트에 적합할지 고민 이되었습니다. 이를 위해 각각의 웹 서버의 탄생 배경과 장단점에 대해서 알아보았습니다.

## 1. Apache

아파치 서버는 요청이 들어오면 커넥션 형성을 위해서 프로세스를 생성합니다.

따라서 새로운 클라이언트의 요청이 들어올 때 마다 새로운 프로세스를 생성하게 됩니다.

프로세스를 만드는 데는 상당한 비용과 시간이 필요하기 때문에 요청이 들어오기 전에 정해진 수의 프로세스를 미리 만들어 놓는 `PreFork` 방식을 사용합니다.

새로운 요청이 들어오면 미리 만들어놓은 프로세스를 할당해주고, 더 이상 할당할 프로세스가 없다면 추가로 프로세스를 만들어서 사용하게 됩니다.

이러한 아파치의 구조 덕분에 **확장성이 좋으며** 다양한 모듈을 만들어서 서버에 빠르게 기능을 추가하는 것이 가능했습니다. 그뿐만 아니라 요청받고, 응답을 처리하는 과정을 **하나의 서버에서** 해결할 수 있게 되었습니다.

하지만 스마트폰이 보급되고 서버에 동시 커넥션 수가 많아지게 되면 서버가 더 이상 커넥션을 생성하지 못하는 문제가 있습니다.

이를 `C10K` 문제라고 부릅니다.

### 1- 1. **Apache의 문제점 - 동시 커넥션을 처리하기엔 부적합 하다.**

동시 커넥션 수가 많아지면 프로세스 생성 수가 많아지고 이는 곧 메모리 부족 문제로 이어지게 됩니다.

게다가 여러 기능을 쉽게 추가할 수 있다는 확장성 때문에 프로세스가 차지할 리소스의 양도 많아집니다.

많은 커넥션에서 요청이 들어오기 시작하면, CPU는 컨텍스트 스위칭을 해가며 프로세스마다 요청을 처리해야 하므로 CPU에 부하가 발생하게 됩니다.

## 2. Nginx

앞서 언급한 Apache 서버의 구조적 한계를 극복하고자 등장한 게 바로 `Nginx` 입니다.

Nginx의 master 프로세스는 설정 파일을 읽고, 설정에 맞게 worker 프로세스를 생성합니다.

worker 프로세스는 만들어지면서 listen socket을 배정받으며, 해당 socket에 새로운 사용자로부터 요청이 들어오면, 커넥션을 형성하고 요청을 처리합니다.

커넥션은 헤더에 지정된 keep-alive 시간만큼 유지됩니다. 하나의 worker 프로세스는 형성된 커넥션에 아무런 요청이 없으면 새로운 커넥션을 형성하거나 이미 만들어진 다른 커넥션으로 부터 요청을 처리합니다. 이러한 커넥션 관련된 작업을 `Event` 라고 합니다.

## 2-1. Nginx의 Event 기반 구조

이 Event 들은 OS 커널이 queue 형식으로 worker 프로세스에 전달해 줍니다. Event는 큐에 담긴 상태에서 worker process가 처리할 때까지 비동기 방식으로 대기합니다. worker 프로세스는 하나의 쓰레드로 이벤트를 꺼내서 처리해 나갑니다.

만약 이벤트중 하나가 Disk I/O 와 같이 오래 걸리는 작업일 경우에는 뒤의 요청들이 Blocking 되는 걸 방지하고자 `Thread Pool` 이라는 별도의 공간에서 오래 걸리는 작업을 처리합니다.

즉, worker 프로세스는 수행하던 작업이 오래 걸릴것 같으면 해당 작업을 Thread Pool에 위임하고 큐안의 다른 이벤트를 처리하게 됩니다.

이러한 worker 프로세스는 보통 CPU의 코어 개수만큼 생성되는데, 이 덕분에 CPU의 컨텍스트 스위칭 비용을 줄일 수 있으며, 요청이 없다면 프로세스를 방치하던 아파치와 달리, worker 프로세스가 쉬지 않고 일을 하기 때문에 서버 자원을 효율적으로 사용할 수 있게 됩니다.

이처럼 수많은 동시 커넥션을 빠르게 처리하면서 프로세스는 적게 생산하기 때문에 가볍기 까지 한 장점이 있습니다.

## 2-2. Nginx의 로드 밸런서 역할

프로세스를 적게 만들기 때문에 nginx의 설정을 동적으로 변경하는 것이 가능합니다.

개발자가 설정 파일을 변경하고, nginx의 설정 파일을 적용하면 master 프로세스는 해당 설정에 맞는 worker 프로세스를 새로 생성합니다. 그리고 기존에 있던 worker 프로세스가 더 이상 커넥션을 생성하지 않도록 합니다. 기존 worker 프로세스가 담당하던 이벤트 처리가 끝나면 해당 프로세스를 종료하게 됩니다.

이러한 동적 설정 변경은 nginx 뒷단에 새로운 서버를 추가해야 하더라도 nginx를 종료할 필요가 없게 됩니다. 기존 요청은 계속해서 기존 worker 프로세스가 처리하면서, 뒷단에 서버를 추가하는 게 가능하기 때문입니다.

## Reverse Proxy란?

웹 서버의 역할 중 하나는 WAS에 요청을 보내는 것이며 이를 **리버스 프록시**라고 합니다.

클라이언트는 가짜(proxy) 서버에 요청하면, 프록시 서버가 배후(reverse server)로부터 데이터를 가져오는 역할을 합니다. 여기서 proxy가 nginx이고 reverse server가 WAS를 의미합니다.

nginx.conf 파일의 location 지시어를 사용하여 요청을 배분합니다.

## SSL 터미네이션

nginx가 클라이언트와는 https 통신을 하고 서버와는 http 통신을 하는 것을 말합니다.

서버는 복호화 과정을 담당할 필요가 없어지기 때문에 비즈니스 로직 처리에 리소스를 더 할당할 수 있게 됩니다. 보통의 nginx와 서버는 같은 네트워크 안에 존재하기 때문에 http 통신을 하더라도 보안 위험이 비교적 적습니다.

이 외에도 nginx를 사용하여 CORS 처리, HSTS, TCP/UDP 커넥션 부하 분산 등의 이점을 얻을 수 있습니다.

Nginx의 동시 커넥션 처리 이점이 현재 진행 중인 프로젝트에 더 적합하다고 느껴졌기 때문에 Nginx를 프로젝트에 적용하기로 하였습니다.

Nginx를 서버 내에 설치하는 과정을 다음과 같이 진행하였습니다.

## ssh연결 통한 Nginx 설치

OS : Ubuntu 18.04

### 설치

- nginx 설치
    - `sudo apt-get install nginx`
- nginx 설치(버전) 확인
    - `nginx -v`

![스크린샷 2022-04-14 오전 1.16.49.png](https://i.imgur.com/gef0g1z.png)

nginx -v를 했을때 버전 정보가 출력된다면 성공적으로 설치된것입니다.

우리는 apt-get을 이용한 패키지 설치를 하였기 때문에 nginx가 `/etc/nginx` 폴더에 설치되었습니다.

(직접 compile한 경우에는 `/usr/local/nginx/conf` 또는 `/usr/local/etc/nginx`에 설치됩니다.



### 80 port → WAS

80번 포트로 들어온 요청을 톰캣 서버로 리버스 프록시하도록 설정하였습니다.

- `vim /etc/nginx/sites-enabled/default`

![스크린샷 2022-06-03 오후 9.10.28.png](https://i.imgur.com/Uq0P668.png)

```bash
upstream <업스트림 이름> {
	    <로드밸런싱 알고리즘. 디폴트는 RoundRobin>;
	    server <host1>:<port1>;
	    ...
	    server<hostN>:<portN>;
}
```

“upstream”의 사전적 의미를 살펴보면 강의 상류를 의미합니다. 강의 상류에서 여러 하류로 물을 이동시켜 주는 특징이 nginx가 여러 서버에 분배하는 것과 비슷하기 때문에 **nginx를 upstream 서버**라고 부릅니다.

로드밸런서는 사용자 요청(Load)를 여러 서버로 분배하는데 분배 방법에 따라 여러 기법이 존재합니다.

로드밸런싱 알고리즘으로 아무것도 적지 않으면 기본값인 `RoundRobin`으로 동작하게 되는데, `ip_hash` 방식으로 요청을 분배하도록 설정하였습니다.

**ip_hash 방식**을 사용하면 ip를 해시값으로 해서 요청을 분배하게 되며 한번 접속했던 ip는 계속 같은 서버를 사용하게 됩니다.

현재 저희는 한대의 WAS만을 사용하고 있기 때문에 클라이언트의 요청이 같은 ip 주소로 들어가는걸 보장 하도록 ip_hash 방식을 사용하였으며 아래에는 하나의 WAS ip주소와 포트 번호를 입력해주었습니다.

```bash
server {
	...
	server_name <도메인>
	location <url> {
		proxy_pass http://<업스트림 이름>
	}
  	...
}
```

서버의 location에서 로드 밸런싱할 url을 root로 설정하고 proxy_pass에 앞서 작성한 업스트림을 붙혀주었습니다.

- `server_name`
    - 리버스 프록시를 적용하고자 하는 도메인을 입력해 줍니다. ex) naver.com
- `location`
    - root(/)로 요청이 들어오면 지정해놓은 tomcat 8080포트로 요청을 넘겨줍니다.

### Nginx 실행

- / root 경로로 가서
    - `systemctl start nginx`
- Nginx 실행 확인
    - `systemctl status nginx`

![스크린샷 2022-04-14 오전 2.11.12.png](https://i.imgur.com/SFRaNWO.png)

웹 브라우저에 도메인 IP 주소를 입력하면 톰캣에 잘 연동된것을 확인할 수 있습니다.

## 마치며

지금까지 프로젝트에 웹 서버를 도입한 이유와 Nginx를 선택한 이유, 그리고 설치 과정에 대해서 알아보았습니다.

아직 사용하는 WAS가 한대이기 때문에 로드 밸런싱과 무중단 배포를 적용하지는 않았지만, 프로젝트가 좀 더 진행되면 Nginx를 이용한 로드 밸런싱과 무중단 배포까지의 과정을 정리한 포스트로 돌아오도록 하겠습니다.

---

### 참고 자료 📚

[https://jjeongil.tistory.com/1490](https://jjeongil.tistory.com/1490)

[https://whatisthenext.tistory.com/123](https://whatisthenext.tistory.com/123)

[https://velog.io/@banjjoknim/리버스-프록시](https://velog.io/@banjjoknim/%EB%A6%AC%EB%B2%84%EC%8A%A4-%ED%94%84%EB%A1%9D%EC%8B%9C)

[https://kamang-it.tistory.com/entry/WebServernginxnginx로-로드밸런싱-하기](https://kamang-it.tistory.com/entry/WebServernginxnginx%EB%A1%9C-%EB%A1%9C%EB%93%9C%EB%B0%B8%EB%9F%B0%EC%8B%B1-%ED%95%98%EA%B8%B0)
