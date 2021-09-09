import React, { useEffect, useState } from 'react'
import { View, Text } from '@tarojs/components'
import {
  useReady,
  useDidHide
} from '@tarojs/taro'
import Taro from '@tarojs/taro'
import { AtCard, AtList, AtListItem, AtMessage, AtInput } from "taro-ui"
import { ab2hex } from '../../util/util'
import "./chart.scss"

function Index() {
  let $instance = Taro.getCurrentInstance()
  const [name, setName] = useState("")
  const [deviceId, setDeviceId] = useState("")
  const [chars, setChars] = useState([]);
  const [connected, setConnected] = useState(false);
  const [items, setItems] = useState([])
  const [serviceId, setServiceId] = useState("")

  const getBLEDeviceServices = (deviceId) => {
    wx.getBLEDeviceServices({
      deviceId,
      success: (res) => {
        for (let i = 0; i < res.services.length; i++) {
          if (res.services[i].isPrimary) {
            getBLEDeviceCharacteristics(deviceId, res.services[i].uuid)
            return
          }
        }
      }
    })
  }

  const getBLEDeviceCharacteristics = (deviceId, serviceId) => {
    wx.getBLEDeviceCharacteristics({
      deviceId,
      serviceId,
      success: (res) => {
        setServiceId(serviceId)
        setItems(res.characteristics)
        console.log('getBLEDeviceCharacteristics success', res.characteristics)
        for (let i = 0; i < res.characteristics.length; i++) {
          let item = res.characteristics[i]
          if (item.properties.read) {
            wx.readBLECharacteristicValue({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
            })
          }
          if (item.properties.notify || item.properties.indicate) {
            wx.notifyBLECharacteristicValueChange({
              deviceId,
              serviceId,
              characteristicId: item.uuid,
              state: true,
            })
          }
        }
      },
      fail(res) {
        console.error('getBLEDeviceCharacteristics', res)
      }
    })

    wx.onBLECharacteristicValueChange((char) => {
      let newChars = chars
      newChars.push({
        ...char,
        hex: ab2hex(char.value)
      })
      setChars([...newChars])
    })
  }

  useEffect(() => {
    let params = $instance.router.params
    setName(params.name)
    setDeviceId(params.deviceId)
  }, [1])
  useReady(() => {
    wx.createBLEConnection({
      deviceId,
      success: () => {
        setConnected(true)
        console.log("connected to ", name, deviceId)
        getBLEDeviceServices(deviceId)
      }
    })
    wx.stopBluetoothDevicesDiscovery()
  })

  useDidHide(() => {
    wx.closeBLEConnection({
      deviceId,
    })
  })

  const showItemList = () => {
    return items.map((item) => {
      return <AtListItem title={item.uuid} note={buildPropertiesString(item.properties)} onClick={() => {
        if (!item.properties.write) {
          Taro.atMessage({
            'message': "不支持写操作",
            'type': "warning",
          })
        }

        let buffer = new ArrayBuffer(1)
        wx.writeBLECharacteristicValue({
          deviceId: deviceId,
          serviceId: serviceId,
          characteristicId: item.uuid,
          value: buffer,
          success: (res) => {
            console.log("message write success: ", res)
            Taro.atMessage({
              'message': "写入成功",
              'type': "success",
            })
          },
          fail: (res) => {
            console.log("message write fail: ", res)
            Taro.atMessage({
              'message': "写入失败",
              'type': "error",
            })
          }
        })

      }} />
    })
  }
  const showCharList = () => {
    return chars.map((char) => {
      console.log(char)
      return <AtListItem title={char.hex} note={char.characteristicId} />
    })
  }

  const buildPropertiesString = (properties) => {
    let value = ""
    if (properties.read) {
      value += "read: ✔ "
    } else {
      value += "read: ✘ "
    }

    if (properties.write) {
      value += "write: ✔ "
    } else {
      value += "write: ✘ "
    }

    if (properties.indicate) {
      value += "indicate: ✔ "
    } else {
      value += "indicate: ✘ "
    }

    if (properties.notify) {
      value += "notify: ✔  "
    } else {
      value += "notify: ✘ "
    }

    return value
  }
  return (
    <View className='index'>
      <AtMessage />
      <View className="card">
        <AtCard
          note={deviceId}
          title={name}
          extra={connected ? "连接成功" : "正在连接"}
        >
          <AtList>
            {showItemList()}
          </AtList>
        </AtCard>
      </View>
      <AtList>
        {showCharList()}
      </AtList>
    </View>
  )
}

export default Index