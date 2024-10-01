---
title: @Transactional 내부 메서드 호출시 트랜잭션이 적용되지 않는 이슈
category: spring
thumbnail: https://i.imgur.com/J5SIYtU.png
tags: transactional
date: 2024-10-01 10:00
searchKeywords: transactional, spring boot, aop
description: @Transactional 내부 메서드 호출시 트랜잭션이 적용되지 않는 이슈
---

트랜잭션 처리 코드가 비즈니스 로직과 공존하면 코드의 중복이 발생하고 비즈니스 로직에 집중하기 또한 힘들다.  
Spring이나 Java의 `@Transactional`은 트랜잭션 처리 로직을 추상화하여 개발자가 어노테이션 하나만으로 트랜잭션을 쉽게 적용할 수 있도록 도와준다. 이를 통해 코드의 중복을 제거하고, 코드를 간결하고 가독성 있게 작성할 수 있다.

그러나 모든 추상화가 그렇듯이, 동작 원리를 이해하지 않고 사용하면 의도치 않은 문제를 겪을 수 있다.

최근 팀에서 레거시 프로젝트를 작업하면서 의도한 대로 트랜잭션이 적용되지 않는 문제를 마주했는데, 원인이 동일 클래스 내에서 내부 메서드를 호출하는 과정에 있었다는 걸 알게 되었다.

이번 글에서는 `@Transactional`의 동작 원리와 동일 클래스에서 내부 메서드를 호출했을 때 트랜잭션이 적용되지 않은 이유를 알아보고, 이를 해결하는 방법에 대해서 알아보도록 하겠다.

# @Transactional 동작 원리

## AOP와 프록시 패턴을 통한 트랜잭션 관리

AOP란 엔터프라이즈 어플리케이션을 개발하는 데는 부족한 OOP의 한계를 극복시켜 주는 보조적인 프로그래밍 기술로서 트랜잭션, 캐싱, 로깅 등과 같은 부가적인 관심사를 분리하여 모듈화함으로써 개발자가 비즈니스 로직에 집중할 수 있게끔 해준다.

Spring은 프록시 패턴을 사용하여 AOP를 지원한다. 프록시 객체는 타겟 객체로의 메서드 호출을 가로채고, 타겟 객체의 비즈니스 로직이 실행되기 전후로 공통 기능을 적용하는 방식으로 동작한다.

트랜잭션 관리 또한 `@Transactional`이 적용된 메서드가 호출되기 전후로 프록시 객체가 트랜잭션 시작과 종료를 처리한다. 그렇다면 프록시 객체는 어떤 방식으로 생성될까?

## Spring AOP의 두 가지 프록시 방식

Spring은 프록시 객체를 생성하기 위해 두 가지 방식을 제공하는데, 바로 `JDK 동적 프록시`와 `CGLIB 프록시`이다.

### 1. JDK 동적 프록시

Java 표준 라이브러리인 `java.lang.reflect.Proxy` 클래스를 활용하여 인터페이스를 구현하는 프록시 객체를 동적으로(런타임에) 생성한다.

이때 타겟 객체는 최소 하나 이상의 인터페이스를 구현하고 있어야 하며 타겟 객체가 구현한 인터페이스의 추상 메서드를 기반으로 프록시 객체를 생성한다.

![Drawing 2024-09-25 18.44.13.excalidraw](https://i.imgur.com/V8LdLQg.png)

인터페이스를 구현한 프록시 객체는 `InvocationHandler`를 통해 타겟 메서드로의 메서드 호출을 가로채고 부가 기능을 처리한다.

만약 트랜잭션 처리 이외에 로깅 처리를 추가로 타겟 메서드에 부여하면 그에 필요한 프록시 객체가 하나 더 생성되며 다음과 같은 순서로 객체가 호출된다.

> ProxyLogging -> ProxyTransaction -> Target

### 2. CGLIB 프록시 (default)

CGLIB (Code Generation LIBrary)는 바이트코드 조작을 통해 런타임에 동적으로 클래스를 생성할 수 있는 라이브러리다.

JDK 동적 프록시 방식과 달리, 타겟 객체를 상속하는 프록시 객체를 생성하기 때문에 타겟 객체가 인터페이스를 구현하지 않아도 프록시를 생성할 수 있다.

프록시 객체는 타겟 객체의 메서드를 오버라이드하여 메서드 호출을 가로채며 메서드 실행 전후로 부가 기능을 처리한다.

Spring Boot 2.x 이후부터는 별도의 설정을 하지 않으면  타깃 객체가 인터페이스를 구현하고 있는지와 상관없이 CGLIB 프록시 방식으로 트랜잭션이 동작한다.

> [AOP in Spring Boot, is it a JDK dynamic proxy or a Cglib dynamic proxy?](https://www.springcloud.io/post/2022-01/springboot-aop/#gsc.tab=0)

# 내부 메서드와 AOP 프록시

`@Transactional`이 어떤 원리로 동작하는지 알아보았으니, 이제 동일 클래스 내에서 내부 메서드를 호출했을 때 트랜잭션이 적용되지 않는 케이스와 그 이유를 분석해 보자.

```java
@Service  
@RequiredArgsConstructor  
public class TransportService {  
  
    private final TransportRepository transportRepository;  
  
    public void sendTransportEvents(List<Long> transportIds) {  
        transportRepository.changeStatuses(transportIds);  
        // 전송...  
    }  
}
```

```java
@Repository  
public interface TransportRepository {  
  
    void save(Transport transport);  
  
    default void changeStatuses(List<Long> transportIds) {  
        for (Long transportId : transportIds) {  
            changeStatus(transportId);  
        }  
    }  
  
    void changeStatus(Long transportId);  
  
    Optional<Transport> findById(Long id);  
}
```

```java
@Repository  
@RequiredArgsConstructor  
public class TransportRepositoryImpl implements TransportRepository {  
  
    private final TransportJpaRepository transportJpaRepository;  
  
    @Override  
    public void save(Transport transport) {  
        transportJpaRepository.save(transport);  
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override    
    public void changeStatus(Long transportId) {  
        Transport transport = transportJpaRepository.findById(transportId).orElseThrow();  
        transport.updateStatus(TransportStatus.SENT);  
    }  
  
    @Override  
    public Optional<Transport> findById(Long id) {  
        return transportJpaRepository.findById(id);  
    }  
}
```

```java
@SpringBootTest  
class TransportServiceTest {  
  
    @Autowired  
    private TransportService sut;  
    @Autowired  
    private TransportRepository transportRepository;  
  
    @Test  
    void 운송_이벤트가_전송되면서_상태를_SENT로_변경한다() {  
        // given  
        var transportA = new Transport(1L, TransportStatus.PENDING);  
        var transportB = new Transport(2L, TransportStatus.PENDING);  
        List.of(transportA, transportB).forEach(transportRepository::save);  
  
        // when  
        sut.sendTransportEvents(List.of(1L, 2L));  
  
        // then  
        var result1 = transportRepository.findById(1L).get();  
        var result2 = transportRepository.findById(2L).get();  
  
        assertThat(result1.getStatus()).isEqualTo(TransportStatus.SENT);  
        assertThat(result2.getStatus()).isEqualTo(TransportStatus.SENT);  
    }  
}
```

`TransportRepositoryImpl.changeStatus(transportId)`에서 JPA의 더티 체킹을 활용해 transport의 상태 값을 `PENDING`에서 `SENT`로 변경을 시도하고 있다.

JPA의 더티 체킹이 의도한 대로 동작한다면 테스트가 통과해야 하지만 테스트가 실패하며 상태 값은 그대로 `PENDING`으로 변하지 않았다.

![스크린샷 2024-10-01 오전 2.05.54.png](https://i.imgur.com/RI75mwO.png)

## 왜 이런 일이 발생할까?

```java
@Repository  
@RequiredArgsConstructor  
@Slf4j  
public class TransportRepositoryImpl implements TransportRepository {  
  
    private final TransportJpaRepository transportJpaRepository;  
    private final EntityManager em;  

	// ...

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @Override    
    public void changeStatus(Long transportId) {    
        Transport transport = transportJpaRepository.findById(transportId).orElseThrow();  
        transport.updateStatus(TransportStatus.SENT);  
  
        if (em.contains(transport)) {  
            log.info("Entity is managed");  
        } else {  
            log.info("Entity is detached");  
        }
        
        log.info("Transaction active: {}", TransactionSynchronizationManager.isActualTransactionActive());  
    }
}
```

더티 체킹이 정상적으로 동작하기 위해서는 엔티티가 영속성 컨텍스트에서 관리되고 있어야만 한다. 하지만 로그를 확인해 보면 Transport 엔티티는 영속성 컨텍스트에 관리되고 있지 않은데, 그 이유는 바로 다음 로그에서 확인할 수 있듯이 해당 메서드에 트랜잭션이 적용되지 않았기 때문이다.

![스크린샷 2024-10-01 오전 2.35.24.png](https://i.imgur.com/BANQI7X.png)

영속성 컨텍스트의 생명주기는 트랜잭션과 동일하다. 트랜잭션이 활성화되지 않으면 영속성 컨텍스트가 생성되지 않으며, 이에 따라 엔티티는 영속성 컨텍스트에서 관리되지 않는다. 따라서, 트랜잭션이 적용되지 않은 `changeStatus()` 메서드에서 영속성 컨텍스트가 생성되지 않으므로 더티 체킹이 동작하지 않는 것이다.

Spring은 CGLIB을 사용하여 `TransportRepositoryImpl` 객체를 상속받는 프록시 객체를 생성한다. 이 프록시 객체는 `@Transactional`이 붙은 `changeStatus()` 메서드를 오버라이드하여, 트랜잭션 관련 로직을 메서드 호출 전후에 삽입한다.

문제는 changeStatuses() 메서드가 같은 클래스 내에서 changeStatus()를 직접 호출하는 방식으로 작성되었기 때문에 발생한다. Spring 프록시는 클래스 외부에서 호출되는 경우에만 트랜잭션을 처리할 수 있으며, 자기 자신 내에서 호출하는 메서드는 프록시를 거치지 않고 호출되기 때문에 트랜잭션이 적용되지 않는다.

### 왜 내부 호출은 프록시를 거치지 않을까?

Spring AOP에서 프록시는 **외부 클라이언트가 호출할 때** 동작한다. 즉, 외부에서 프록시 객체를 통해 메서드를 호출하면 프록시 객체는 이 호출을 가로채고 트랜잭션 등의 부가 기능을 처리한다. 
동일 클래스 내에서 호출되는 경우는 외부에서 메서드 호출이 발생한 것이 아니며 자기 자신의 인스턴스를 통한 호출이기 때문에, 프록시 객체를 거치지 않고 실제 메서드가 바로 호출된다.

이를 해결하기 위해서 `@Transacional`을 외부 메서드에 붙이는 것이 권장된다. 혹은 내부 메서드를 별도의 클래스로 분리하여 외부에서 호출하도록 하는 방법도 있다.

### 마무리

@Transactional의 동작 원리에 대해 어느 정도 알고 있다고 생각했는데 이번 문제를 겪으면서 아직 명확히 정리되어 있지 않다는 것을 느꼈다.

글을 작성하면서 정리되지 않고 점으로만 존재하던 지식이 선으로 연결되는 듯한 느낌을 받았다. 바쁘다고 글 쓰는 걸 미루지 말고 글로 지식과 경험을 내재화하는 습관을 가져야겠다.


---

**참고 자료**

- [Proxying Mechanisms](https://docs.spring.io/spring-framework/reference/core/aop/proxying.html)
- [In Java, why are dynamic proxies only allowed to proxy interface classes?](https://www.quora.com/In-Java-why-are-dynamic-proxies-only-allowed-to-proxy-interface-classes)
