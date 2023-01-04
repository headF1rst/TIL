---
title: PWA 환경에서 푸시 알림 구현하기 (Spring Boot, FCM, Redis)
category:
thumbnail: https://www.pushengage.com/wp-content/uploads/2021/11/Best-FREE-Push-Notification-Services.png
tags: 프로젝트
date: 2023-01-03 10:00
---

푸시 알림이란 사용자가 서비스를 사용하고 있지 않은 상황에서도 사용자에게 알림을 보내는 방법입니다.

푸시 알림을 구현하는 방법에는 `Server-Sent Events (SSE)` 를 사용하는 방식과 `Firebase Cloud Messaging (FCM)` 을 사용하는 방식이 있습니다.

## 1. SSE vs FCM

SSE는 실시간으로(real-time) 서버에서 클라이언트로 데이터를 전송하는 간단한 프로토콜입니다. 클라이언트와 서버 간의 HTTP 연결을 연 다음 해당 연결을 통해 클라이언트의 요청이 없더라도 서버에서 클라이언트로 데이터를 이벤트로 전송하여 작동합니다. SSE는 서버에서 클라이언트로 실시간으로 데이터를 보내려는 시나리오에 유용합니다.

반면 FCM(Firebase Cloud Messaging)은 안드로이드, iOS, 웹을 포함한 다양한 플랫폼의 사용자에게 메시지를 보낼 수 있는 더 완전한 기능의 크로스 플렛폼 메시징 솔루션입니다. 특정 장치 또는 주제(특정 주제에 가입된 장치 그룹)로 메시지를 보내는 기능을 포함하여 메시지를 전달하기 위한 다양한 옵션을 제공합니다. FCM은 또한 우선 순위가 높거나 낮은 메시지를 보내거나 오프라인 상태인 장치에 메시지를 보내고 다시 온라인 상태가 되면 메시지를 전송하는 등 다양한 전송 옵션을 지원합니다.

SSE는 구현이 간단하고 real-time 서비스이지만 몇가지 제한이 존재합니다.

반면 FCM의 경우, SSE에 비해서 별도의 설정이 추가로 필요하며 real-time 서비스이긴 하지만 장치 연결 상태, 메시지의 크기와 포멧, 그리고 네트워크 상태 등 전송 시간이 지연될 수 있는 요소들이 존재합니다. 하지만 심각한 지연이 발생하지는 않으며 SSE의 실시간성에 비해서 느린 편이기 때문에 연성 실시간(soft real-time) 시스템에 적합합니다.

## 2. 현재 서비스에 더 적합한 쪽은?

현제 구현하고자 하는 기능은 푸시 알림이며, 가능한 빨리 전달되어야 하지만 시스템에 높은 부하가 걸렸을 때 약간의 지연은 무방합니다. 또한 iOS, 안드로이드, 데스크톱을 지원해야 합니다. 

이러한 요구사항을 종합해 보았을때 다양한 플랫폼을 지원하며 연성 실시간 시스템이어도 문제가 없는 FCM을 사용하여 알림기능을 구현하는 방향을 선택하였습니다. 

## 3. 푸시 알림을 위한 3가지 컴포넌트

![IMG_68FC117D3621-1.jpeg](https://i.imgur.com/aQq4OJ4.jpg)

- **알림 제공자**
    
    알림 요청(notification request)를 만들어 푸시 알림 서비스(FCM)로 보내주는 주체.
    
    알림 요청을 만들기 위해서는 다음과 같은 데이터가 필요하다.
    
    - 단말 토큰 (device token)
        - 알림 요청을 보내는 데 필요한 고유 식별자.
    - 페이로드 (payload)
        - 알림 내용을 담은 JSON 딕셔너리
- **FCM**
    - 구글이 제공하는 원격 서비스. 푸시 알림을 다양한 플랫폼으로 보내는 역할을 담당
- **디바이스 장치**
    - 푸시 알림을 수신하는 사용자 단말
    

3가지 컴포넌트 중 알림 제공자에 해당하는 로직을 구현해 보도록 하겠습니다.

## 4. 알림 시스템 아키텍처

알림 제공자 역할을 하는 별도의 인스턴스를 생성하여 어플리케이션 서버와 알림 서버를 분리해야 할지, 어플리케이션 서버에 알림 기능을 추가해야 할지 고민이 되었습니다.

푸시 알림 시스템이 대량의 요청을 처리할 것으로 예상되거나 높은 수준의 가용성이 필요한 경우, 효과적으로 작동하는 데 필요한 리소스와 용량을 확보하기 위해 다음과 같이 별도의 인스턴스를 사용하는 것이 유용할 수 있습니다. 

![스크린샷 2023-01-02 오후 10.44.34.png](https://i.imgur.com/zBICeHZ.png)

또한 별도의 인스턴스를 사용하면 푸시 알림 시스템에 대한 격리 및 제어 기능을 더 많이 제공할 수 있으므로 보안 및 규정 준수 목적에 유용할 수 있습니다.

반면, 푸시 알림 시스템의 workload가 크지 않은 경우 기존 응용프로그램과 동일한 인스턴스를 사용하는 것이 비용 측면에서 효율적일 수 있습니다. 이렇게 하면 관리 및 유지해야 하는 인스턴스 수를 줄일 수 있어 리소스를 절약하고 복잡성을 줄일 수 있습니다.

저희 서비스의 경우 사용자가 편지를 받는 경우에만 알림 요청이 발생하고 아직 사용자가 많지 않은점, 그리고 비용적인 측면을 고려하여 기존 응용프로그램과 동일한 인스턴스를 사용하기로 결정하였습니다. (~~서비스가 대박이나서 아키텍처 수정하는 날이 오면 좋겠습니다~~)

![스크린샷 2023-01-02 오후 10.45.48.png](https://i.imgur.com/eb0TAnG.png)

## 5. FCM을 Spring Boot 프로젝트에 적용하기

먼저 FCM을 사용할 프로젝트에 `firebase-admin` 의존성을 추가해주었습니다.

### 5.1 의존성 추가

- **build.gradle**

```bash
dependencies {
	//FCM
	implementation 'com.google.firebase:firebase-admin:7.1.1'
}
```

### 5.2 Firebase 프로젝트, 비공개 키 생성

[Firebase 콘솔](https://console.firebase.google.com/u/0/)에 접속하여 프로젝트를 생성하고, `프로젝트 설정 → 서비스 계정 항목`에서 비공개 키를 생성하였습니다.

![스크린샷 2023-01-02 오후 11.54.08.png](https://i.imgur.com/A4pqklA.png)

json 파일로 생성된 `admin sdk` 를 프로젝트의 resouces 디렉토리로 이동시켜 주었습니다. 비밀키 파일은 깃허브와 같은 공개된 장소에 올라가는게 안전하지 않기 때문에 .gitignore 목록에 추가한 다음 @Value를 사용하여 불러오도록 하였습니다.

`개요 → 앱 추가 → 웹 앱에 Firebase 추가`를 선택하고 스니펫을 복사하여 어플리케이션 HTML에 추가하였습니다.

- **templates/firebase-snippet.html**

```html
<script type="module">
    // Import the functions you need from the SDKs you need
    import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
    import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
    // TODO: Add SDKs for Firebase products that you want to use
    // https://firebase.google.com/docs/web/setup#available-libraries

    // Your web app's Firebase configuration
    // For Firebase JS SDK v7.20.0 and later, measurementId is optional
    const firebaseConfig = {
        apiKey: "AIzaSyAhGBd-3pzg1HzHvGJ6poVatZ9t4fcRC7g",
        authDomain: "text-me-917f5.firebaseapp.com",
        projectId: "text-me-917f5",
        storageBucket: "text-me-917f5.appspot.com",
        messagingSenderId: "357915322625",
        appId: "1:357915322625:web:694139cec2a5c263b81300",
        measurementId: "G-WXZEPBL34M"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
</script>
```

### 5.3 FCM 초기화

어플리케이션이 실행되는 시점에 비공개 키 파일의 인증정보를 이용해 FirebaseApp을 초기화하는 객체를 구현해주었습니다.

![스크린샷 2023-01-03 오전 12.42.03.png](https://i.imgur.com/fRZCUPV.png)

 

빈 객체가 생성되고 의존성 주입이 완료된 후에 초기화가 실행될 수 있도록 @PostConstruct 설정을 해주었습니다.

### 5.4 토큰 관리 저장소

로그인시에 클라이언트는 FCM 토큰(단말 토큰)을 서버에 전달하게 되는데 서버는 해당 토큰을 스토리지에 저장한 다음, 활성 토큰의 목록을 유지해야 합니다. FCM 공식 문서에 있는 [토큰 관리 Best practice](https://firebase.google.com/docs/cloud-messaging/manage-tokens?hl=ko)에 따르면 토큰의 신선도 보장을 위해서 2개월 이상 사용되지 않은 토큰은 삭제하는 것을 권장하고 있습니다.

처음에는 현재 사용하고 있는 RDS의 유저 테이블에 FCM 토큰 필드를 추가하는 방식을 고려하였습니다. 하지만 토큰 갱신 및 삭제 연산이 빈번하게 발생하고 토큰의 데이터가 key-value 형태라는 점, 그리고 타임스탬프를 통해서 토큰의 신선도를 관리해줘야 하는 요구사항에 더 적합한 스토리지가 `Redis`라고 생각되었기 때문에 Redis를 토큰 관리 저장소로 선택하게 되었습니다.

Redis 설치방법과 Config 파일 작성에 대한 내용은 다루지 않고 넘어가도록 하겠습니다.

![스크린샷 2023-01-04 오전 7.40.40.png](https://i.imgur.com/bXt2fWO.png)

![스크린샷 2023-01-04 오전 8.05.41.png](https://i.imgur.com/udaSt5s.png)

### 5.5 편지 전송시 편지 수신 유저에게 알림 전송하기

FCMService를 구현하기에 앞서 NotificationService 인터페이스를 구현하여 상속받도록 해주었는데 그 이유는 FCM 뿐만 아니라 iOS 푸시 알림을 위한 APNs도 사용해야 하기 때문입니다.. (iOS 웹 푸시는 현재 지원되지 않기 때문에 apple wallet을 통한 편법을 사용해야 합니다.)

![스크린샷 2023-01-04 오전 8.11.25.png](https://i.imgur.com/Vj3MNIY.png)

fcm 서버로 메시지를 전송할 때, 서버가 메시지의 응답을 기다리는 동안 블로킹으로 인한 성능 저하를 방지하고자 `sendAsync()` 를 사용하여 메시지를 비동기적으로 처리하였습니다.

![스크린샷 2023-01-04 오전 8.24.04.png](https://i.imgur.com/Pbczsoo.png)

## 6. 마치며

지금까지 FCM을 사용한 푸시 알림을 구현해 보았습니다. 알림 기능을 구현하면서 많은 기술적 고민을 하였고 대안을 검토해 보았습니다. 제 짧은 지식으로는 현재 시점에 가장 좋은 옵션을 고려해보았는데, 다양한 의견들을 댓글을 통해서 공유해주시면 감사하겠습니다. 

---

**참고 자료** 📚

[FCM 등록 토큰 관리 모범 사례 | Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging/manage-tokens?hl=ko)

[[Firebase] FCM을 도입할 때 고려할 것들](https://seungwoolog.tistory.com/88)

[알림 기능을 구현해보자 - SSE(Server-Sent-Events)!](https://gilssang97.tistory.com/69)

[FCM, Spring Boot를 사용하여 웹 푸시 기능 구현하기](https://velog.io/@skygl/FCM-Spring-Boot%EB%A5%BC-%EC%82%AC%EC%9A%A9%ED%95%98%EC%97%AC-%EC%9B%B9-%ED%91%B8%EC%8B%9C-%EA%B8%B0%EB%8A%A5-%EA%B5%AC%ED%98%84%ED%95%98%EA%B8%B0)

[Spring Boot 프로젝트에서 FCM을 이용한 웹 푸시 구현하기](https://kerobero.tistory.com/38)
