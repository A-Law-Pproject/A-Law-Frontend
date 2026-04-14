1) /api/v1/contracts/{id}/voice-records
녹음 파일 생성 (기존 계약서에 연결) POST
### Request body

```jsx
file: Binary File (audio/webm)
duration: number
```

### Response body - 201 Created

```jsx
{
  "success": true,
  "data": {
    "voiceRecordId": 1,
    "contractId": 42,
    "duration": 93,
    "createdAt": "2026-03-31T10:00:00.000Z"
  }
}
```
2)/api/v1/voice-records
녹음 파일 생성 (계약서 연결 없음) POST
### Request body

```jsx
file: Binary File (audio/webm)
duration: number
```

### Response body - 201 Created

```jsx
{
  "success": true,
  "data": {
    "voiceRecordId": 2,
    "contractId": null,
    "duration": 60,
    "createdAt": "2026-03-31T10:05:00.000Z"
  }
}
```

3)  /api/v1/voice-records
전체 녹음 목록 조회 (마이페이지 → 녹음목록) GET
### Request body

```jsx

```

### Response body - 200 OK

```jsx
{
  "success": true,
  "data": [
    {
      "voiceRecordId": 1,
      "contractId": 42,
      "contractTitle": "원룸 전세 계약서",
      "duration": 93,
      "createdAt": "2026-03-31T10:00:00.000Z"
    },
    {
      "voiceRecordId": 2,
      "contractId": null,
      "contractTitle": null,
      "duration": 60,
      "createdAt": "2026-03-31T10:05:00.000Z"
    }
  ]
}
```

4) /api/v1/contracts/{id}/voice-record
특정 계약서의 녹음 목록 조회 (기존 계약서 연결시) GET
### Request body

```jsx

```

### Response body - 200 OK

```jsx
{
  "success": true,
  "data": [
    {
      "voiceRecordId": 1,
      "contractId": 42,
      "contractTitle": "원룸 전세 계약서",
      "duration": 93,
      "createdAt": "2026-03-31T10:00:00.000Z"
    }
  ]
}
```

5) /api/v1/voice-records/{id}
녹음 파일 삭제 DELETE
### Request body

```jsx

```

### Response body - 200 OK

```jsx
{
  "success": true
}

```
