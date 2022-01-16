## client 에 옵션설정(global)

## 각 useQuery 에 옵션설정 : global 옵션에 다시 덮어씀()

## prefetch 에 옵션을 넣을때 -> trigger 는 작동을 하게끔 만들어야함

- refetchOn~~ 옵션을 true로 할 것

## useQuery Optioins

- select : 받아온 데이터 가공하는 콜백함수(useCallback 쓰면 최적화도됨)
- staleTime : 잘 안변하는 데이터 시간 설정(stale 상태일때는 다시 리패칭 하지 않는다.)
- refetchOn~~ : 리패칭 안하는 경우(boolean)

## prefetch

- queryClient.preFetch 하면된다.유즈쿼리 옵션도 넣는것은 가능하나 select 옵션은 안먹힌다.

## typescript 무시 하는 방법

@ts-nocheck top of the file
@ts-ignore above problem line

## Centralize

- useQuery config 활용(isFetching, onError 등등)
- queryClient config 활용(ondefault onerror 캬... )

```
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onError: (error) => queryErrorHandler(error),
    },
  },
});
```

## 느낀점

- axios 와 react-query 를 동시에 사용하면 중복되는 점이 많다.
- 그러므로 결론은 react-query만 쓴다.
- api 를 따로 모아서 폴더로 정리한 다음. 그걸 빼와서 사용 하는데. 사용 후 바로 리덕스 같은데 넣는 형식이 좋음.
