---
title: "[오브젝트] 6장 - 메시지와 인터페이스"
category: object
thumbnail: https://wikibook.co.kr/images/cover/m/9791158391409.png
tags: object
date: 2022-09-26 10:00
---


객체지향 어플리케이션의 가장 중요한 재료는 객체들이 주고받는 `메시지` 이다.

유연하고 재사용 가능한 퍼블릭 인터페이스를 만드는 설계 원칙과 기법이 이번장의 핵심

## 협력과 메시지
- 클라이언트 - 서버 모델
- 메시지와 메시지 전송
    - 메시지 = 오퍼레이션명 + 인자
        - `isSatisfiedBy(screening)`
    - 메시지 전송 = 오퍼레이션명 + 인자 + 메시지 수신자
        - `condition.isSatisfiedBy(screening)`
- 메서드
    - 메시지를 수신했을 때 실제로 실행되는 함수 또는 프로시저

### 실행 시점에 메시지와 메서드를 바인딩하는 메커니즘
- 두 객체 사이의 결합도를 낮춤
- 유연하고 확장 가능한 코드 설계

- 퍼블릭 인터페이스
    - 객체가 의사소통을 위해 외부에 공개하는 **메시지의 집합**
- 오퍼레이션
    - 수행 가능한 어떤 행동에 대한 추상화
    - 퍼블릭 인터페이스에 포함된 메시지
- 메서드
    - 메시지를 수신했을때 실제로 실행되는 코드
    - 오퍼레이션의 구현
- 시그니처
    - 오퍼레이션이나 메서드의 명세를 나타낸것
        - 오퍼레이션의 이름과 파라미터의 목록의 합

클라이언트 -> 메시지 전송 -> 오퍼레이션 호출 -> 서버, 메서드 실행

## 인터페이스와 설계 품질

좋은 인터페이스란?
최소한의 인터페이스와 추상적인 인터페이스라는 조건을 만족해야한다.

- 최소한의 인터페이스
    - 꼭 필요한 오퍼레이션만을 인터페이스에 포함
- 추상적인 인터페이스
    - 어떻게 수행하는지가 아닌 무엇을 하는지를 표현

책임 주도 설계 방법을 통해서 좋은 인터페이스를 설계할 수 있다.
(메시지가 객체를 선택하게 하라)

### 퍼블릭 인터페이스의 품질에 대한 원칙 및 기법

- 디미터 법칙
    - 낯선 자에게 말하지 말고 인접한 이웃하고만 말하라
    - 협력 경로를 제한하라
- 묻지말고 시켜라
    - 객체의 상태에 대해 묻지 말고 원하는 것을 시켜라
    - 내부의 상태를 이용해 어떤 결정을 내리는 로직이 객체 외부에 존재해서는 안된다.
        - 캡슐화 위반
    - 상태를 묻는 오퍼레이션을 행동을 요청하는 오퍼레이션으로 대체하라
- 의도를 드러내는 인터페이스
    - 메서드의 이름은 어떻게가 아니라 무엇을 하는지를 드러내야 한다.
    - 클라이언트 관점에서 협력을 바라보고 클라이언트의 의도를 담을 수 있는 메서드명을 선
      택하라.
    - 클라이언트가 객체에게 무엇을 원하는지를 명확하게 표현해야 한다.
    - 메서드가 무엇을 하느냐에 초점을 두면 동일한 작업을 수행하는 메서드들을 하나의 타입 계층으로 묶을 수 있는 가능성이 커진다.
- 명령 - 쿼리 분리 원칙
    - 명령 = 프로시저
        - 부수효과를 발생시킨다.
        - 값을 반환할 수 없다.
    - 쿼리 = 함수
        - 부수효과를 발생시킬 수 없다.
        - 값을 반환한다.

어떤 메서드가 부수효과를 가지는지 확인하기 위해서 메서드의 반환 값을 가지는지 여부만 확인하면 된다.

코드는 예측 가능하고 이해하기 쉬우며 디버깅이 용이한 동시에 유지보수가 수월해진다.

``` java
if (!event.isSatisfied(schedule)) { // 쿼리
	event.reschedule(schedule); // 명령
}
```

명령과 쿼리가 분리되지 않은 안좋은 예

``` java
public class Event {

	public boolean isSatisfied(RecurringSchedule schedule) {
		if (from.getDayOfWeek() != schedule.getDayOfWeek() ||
		!from.toLocalTime().equals(schedule.getFrom()) || 
		!duration.equals(schedule.getDuration())) {
			reschedule(schedule); // BAD !! 쿼리에 명령이 포함됨.
			return false;
		}
		return true;
	}
}
```

## 참조 투명성과 함수형 프로그래밍

명령과 쿼리를 분리함으로써 명령형 언어의 틀 안에서 **참조 투명성**의 장점을 누릴 수 있게 된다.

- 참조 투명성
    - 어떤 표현식 e가 있을 때 e의 값으로 e가 나타나는 모든 위치를 교체하더라도 결과가 달라지지 않는 특성
    - 동일한 값을 출력하는 함수의 특성을 사용하여 식을 값으로 치환하는 방법을 통해 결과를 쉽게 계산해준다.

## 느낀점

설계는 결국 트레이드오프의 산물이며 원칙을 추종하지 않고 상황에 따라 원칙을 무시할 수 있는 판단이 필요하다. 이러한 판단은 수많은 프로젝트 설계 경험을 통해서 얻을 수 있겠지만 주니어 개발자인 우리가 어떻게 하면 이러한 역량을 빠르게 쌓을 수 있을지 고민해 보았다.

개인적인 생각으로는 구성원간의 설계에 대한 토론이 설계 역량을 쌓는데 가장 좋은 수단이 될 수 있을것이라고 생각한다. 다양한 구성원들간 의견 공유를 통해서 다른 사람의 생각을 들어보고 내가 미처 생각해보지 못한 관점을 듣는 것이 설계 역량을 키우는데 도움이 될 것이라고 생각한다.

이를 위해서는 자신의 의견을 언제든지 말할 수 있는 조직문화가 기반이 되어야 하며 이러한 조직내 분위기를 만들기 위한 노력 또한 우리가 해야하는 역할이지 않을까 생각해 보았다.
