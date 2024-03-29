---
title: "[오브젝트] 2장 - 객체지향 프로그래밍"
category: object
thumbnail: https://wikibook.co.kr/images/cover/m/9791158391409.png
tags: object
date: 2022-08-29 10:00
---

클래스를 먼저 결정하고, 어떤 `속성`과 `메서드`가 필요한지 고민하는것리 아니라 `객체`에 초점을 맞춰야한다

1. 어떤 클래스가 필요한지 이전에 어떤 객체가 필요한지 고민하라
   클래스는 공통적인 상태, 행동을 공유하는 객체를 추상화한것

2. 객체는 독립적인 존재가아닌 협력하는 공동체의 일원이다

- 객체의 윤곽을 잡고 공통된 특성과 상태를 가진 객체들을 **타입** 으로 분류하라
- 타입을 기반으로 클래스를 구현하라

클래스의 내부와 외부를 구분. 경계를 명확하게하여 객체의 자율성을 보장한다 -> 개발자의 구현의 자유 제공

객체는 상태와 행동을 갖고 스스로 판단하고 행동하는 자율적인 존재

데이터와 기능을 객체 내부로 함께 묶는것 -> `캡슐화`

- 객체를 이용해서 타입을 정의하도록 하자
    - 의미를 명시적이고 분명하게 표현 할 수 있으며 이는 설계의 명확성과 유연성을 높인다

협력 관점에서 어떤 객체가 필요할지 결정하고 객체들의 공통 상태와 행위를 구현하기 위해 클래스를 작성

### 의존성의 양면성

코드의 의존성과 실행시점의 의존성은 다를수 있다.
두 의존성이 다르면 다를수록 코드는 더 유연해지고 확장성이 좋아진다.

반면 코드를 이해하기 위해서는 객체를 생성하고 연결하는 부분을 찾아야하기 때문에 코드를 이해하기는 힘들어진다

설계는 곧 `트레이드오프의 산물`.

### 다형성


인터페이스 -> 객체가 이해할 수 있는 메시지의 목록을 정의

메세지와 메서드는 다른개념이다.

예를들어 영화 객체가 할인 정책 객체의 인스턴스에 calculateDiscountPolicy 메시지를 전송한다.

실행되는 메서드는 영화와 협력하는 객체, 즉 메시지를 수신하는 객체의 클래스가 무엇이냐에 따라 달라진다. - `다형성`

다형성은 객체지향 프로그램의 컴파일 시간 의존성과 실핼 시간 의존성이 다를 수 있다는 사실을 기반으로 한다

다형적 협력에 참여하는 객체들은 모두 같은 메시지를 이해할 수 있어야 한다 -> 인터페이스가 동일해야 한다

인터페이스를 통일하기 위해 사용한 방법 -> 상속

**동적 바인딩:** 메시지와 메서드를 실행 시점에 바인딩

**정적 바인딩**: 컴파일 시점에 실행될 함수나 프로시저를 결정하는것

우리는 동적 바인딩 메커니즘을 사용하여 컴파일 시점의 의존성과 실행 시점의 의존성을 분리하고 하나의 메시지를 선택적으로 다른 메서드에 연결할 수 있다

상속을 사용하여 동일한 인터페이스를 공유하는 클래스들을 하나의 **타입 계층**으로 묶을수 있다

### 구현 상속과 인터페이스 상속

**구현 상속 (서브클래싱)** : 코드 재사용 목적으로 상속을 사용한 경우

**인터페이스 상속 (서브타이핑)** : 다형적인 협력을 위해 부모 클래스와 자식 클래스가 인터페이스를 공유 할 수 있도록 상속을 사용한 경우

인터페이스를 재사용할 목적이 아니라 구현을 재사용할 목적으로 상속을 사용하면 변경에 취약한 코드를 생산할 수 있다

### 추상화의 장점
- 추상화의 계층만 따로 보면 요구사항의 정책을 높은 수준에서 서술할 수 있다
- 상위 정책을 기술하여 어플리케이션의 협력 흐름을 술
- 설계가 유연해진다

### 유연한 설계
예외 케이스를 최소화하고 일관성을 유지할 수 있는 방법을 선택하라

유연성이 필요한 곳에 추상화를 사용하라

### 코드 재사용
코드를 재사용 하기 위해서는 상속보다는 **합성**을 사용하라

### 코드 재사용으로 상속을 지양하는 이유

코드 재사용을 목적으로 상속을 사용하면 설계에 안좋은 영형을 끼친다.

- 캡슐화를 위반
  상속을 이용하기 위해서 개발자는 부모 클래스릐 내부 구조를 알아야한다

결과적으로 부모 클래스가 자식 클랴스에 노출되어 캡슐화가 약화된다

캡슐화가 약화되어 자식이 부모 클래스와 강하게 결합되기 때문에 부모 클래스가 변경되면 자식 클래스도 함께 변경되야 한다

- 유연하지 못한 설계
  부모 클래스와 자식 클래스 사이의 관계를 컴파일 시점에 결정하기 때문에 실행 시점에 객체 종류 변경이 불가능

### 합성을 사용해서 코드를 재사용하자

`합성`
- 인터페이스에 정의된 메시지를 통해서만 코드를 재사용하는 방법.

``` java
public class Movie {
    ...
    private DiscountPolicy discountPolicy;
    ...

    public Money calculateMovieFee(Screening screening) {
        return fee.minus(discountPolicy.calculateDiscountAmount(screening));
    }
}
```

`Movie`는 요금 계산을 위해 `DiscountPolicy`의 `calculateDiscountAmount()` 코드를 재사용한다.

`Movie`는 `DiscountPolicy`인터페이스를 통해 약하게 결합되어있다 (의존하고 있다).

실제로 `Movie`는 `DiscountPolicy`가 외부에 `calculateDiscountAmount()` 메서드를 제공한다는 것만 알고 내부 구현에 대해서는 전혀 모른다.


합성의 장점은 다음과 같다

- 구현을 효과적으로 캡슐화
  인터페이스에 정의된 메시지를 통해서만 재사용 가능하기 때문에.

- 유연한 설계
  의존하는 인스턴스를 교체하는것이 쉽다.

상속은 클래스를 통해 강하게 결합된다.
합성은 메시지를 통해 느슨하게 결합된다.

### 상속을 무조건 쓰지 말라는건 아니다

코드를 재사용하는 경우에는 상속보다는 합성을 선호하는 것이 옳다.

하지만 다형성을 위해 인터페이스를 재사용하는 경우에는 상속과 합성을 함께 조합해서 사용한다.

---

`객체지향 설계의 핵심`:
- 적절한 협력을 식별
- 협력에 필요한 역할을 정의
- 역할을 수행할 수 있는 적절한 객체에 적절한 책임을 할당

### 느낀점

이번 장을 읽으면서, 과거에 한 친구가 단순히 중복을 제거하는 목적으로 상속을 사용한 설계를 저에게 보여줬던 것이 생각났습니다.

당시에도 그러한 설계가 좋지 않은 설계라는걸 알고는 있었지만 모호하게 알고있었기 때문에, 그 친구에게 제 의견을 제대로 전달하지 못했던 경험을 하였습니다.

나 혼자서 아무리 유연한 코드를 짜고 객체지향에 대해 잘 안다고 해도 결국에 하나의 프로젝트는 조직원들이 다 같이 완성해 나가는 것이기 때문에, 팀원들을 설득하지 못한다면 결과물은 객체지향적이지 않은 코드가 나오고 말것입니다.

따라서 내가 배운것을 스스로 적용해 볼 수 있는 수준에서 그치지 않고 누군가에게 설명하고 설득할 수 있는 수준까지 공부하는것이 중요하다는 생각을 해보았습니다.
