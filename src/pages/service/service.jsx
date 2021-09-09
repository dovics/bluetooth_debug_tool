import React, { useEffect, useState } from 'react'
import { View } from '@tarojs/components'
import {
  useReady,
} from '@tarojs/taro'
import { AtInput, AtForm, AtButton, AtListItem, AtList, AtMessage } from 'taro-ui'
import "./service.scss"
import { uuid, hex2ab } from "../../util/util";
import Taro from '@tarojs/taro'

const defaultProperties = {
  write: true,
  writeNoResponse: true,
  read: true,
  notify: true,
  indicate: true,
}

const defaultPermission = {
  readable: true,
  writeable: true,
  readEncryptionRequired: true,
  writeEncryptionRequired: true
}
function Index() {
  const [created, setCreated] = useState(false)
  const [server, setServer] = useState(null)
  const [value, setValue] = useState("");
  const [serviceId, setServiceId] = useState("")
  const [characteristicId, setCharacteristicId] = useState("")
  const [readRequest, setReadRequest] = useState([])
  const [writeRequest, setWriteRequest] = useState([])

  useEffect(() => {
    setServiceId(uuid())
    setCharacteristicId(uuid())
  }, [1])

  useReady(() => {
    wx.openBluetoothAdapter({
      mode: 'peripheral',
      success: (res) => {
        wx.createBLEPeripheralServer({
          success: (result) => {
            console.log('create ble server success')
            let server = result.server
            let name = 'bluetooth_test'
            setServer(server)
            server.onCharacteristicReadRequest((req) => {
              console.log("read request: ", req)
              let newReadRequest = readRequest
              newReadRequest.push(req)
              setReadRequest([...newReadRequest])
            })

            server.onCharacteristicWriteRequest((req) => {
              console.log("write request: ", req)
              let newWriteRequest = writeRequest
              newWriteRequest.push(req)
              setWriteRequest([...newWriteRequest])
            })

            server.startAdvertising({
              advertiseRequest: {
                connected: true,
                deviceName: name,
              },
              success: (res) => {
                console.log("connected success, ", res)
              }
            })
          },
          fail: (res) => {
            console.log('creat ble server fail: ', res)
          },
        })
      },
      fail: (res) => {
        console.log('open failed')
        console.warn(res)
      },
    })
  })

  const handleChange = (value) => {
    setValue(value)
  }
  const onSubmit = (event) => {
    if (!created) {
      server.addService({
        service: {
          uuid: serviceId,
          characteristics: [
            {
              uuid: characteristicId,
              properties: defaultProperties,
              permission: defaultPermission,
              value: hex2ab(value),
            }
          ]
        },
        success: (res) => {
          setCreated(true)
          console.log("create service success: ", res)
        },
        fail: (res) => {
          console.log("create service fail: ", res)
        }
      })

      return
    }

    server.writeCharacteristicValue({
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: hex2ab(value),
      needNotify: true,
      success: (res) => {
        Taro.atMessage({
          message:"更新成功",
          type:"success"
        })
      },
      fail: (res) => {
        Taro.atMessage({
          message:"更新失敗",
          type: "error"
        })
      }
    })

  }

  const showReadRequestList = () => {
    return readRequest.map((req) => {
      return <AtListItem title={req.characteristicId} />
    })
  }

  const showWriteRequestList = () => {
    return writeRequest.map((req) => {
      return <AtListItem title={req.characteristicId} />
    })
  }
  return (
    <View className='index'>
      <AtMessage />
      <View>
        <View className='at-article__h2'>
          service uuid:
        </View>
        <View className='at-article__info'>
          {serviceId}
        </View>
        <View className='at-article__h2'>
          characteristic uuid:
        </View>
        <View className='at-article__info'>
          {characteristicId}
        </View>
      </View>
      <View>
        <AtForm>
          <AtInput
            name='value'
            type='text'
            placeholder='请输入 16 进制数字'
            value={value}
            onChange={handleChange}
          />
          <View className="button">
            <AtButton type={"primary"} onClick={onSubmit}>提交</AtButton>
          </View>
        </AtForm>
      </View>
      <View>
        <View className="list">
          读取请求
          <AtList>
            {showReadRequestList()}
          </AtList>
        </View>
        <View className="list">
          写入请求
          <AtList>
            {showWriteRequestList()}
          </AtList>
        </View>
      </View>
    </View>
  )
}

export default Index