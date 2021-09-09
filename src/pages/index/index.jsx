import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import { AtButton, AtList, AtListItem, AtTag } from 'taro-ui'
import Taro from '@tarojs/taro'

import "taro-ui/dist/style/components/button.scss"
import "taro-ui/dist/style/components/list.scss"
import "taro-ui/dist/style/components/icon.scss";
import './index.scss'
import { inArray } from '../../util/util'

function Index() {
  let _discoveryStarted = false
  const [devices, setDevices] = useState([]);
  useEffect(() => { })

  const scanServices = () => {
    wx.openBluetoothAdapter({
      success: (res) => {
        console.log('openBluetoothAdapter success', res)
        startBluetoothDevicesDiscovery()
      },
      fail: (res) => {
        if (res.errCode === 10001) {
          wx.onBluetoothAdapterStateChange(function (res) {
            console.log('onBluetoothAdapterStateChange', res)
            if (res.available) {
              startBluetoothDevicesDiscovery()
            }
          })
        }
      }
    })
  }

  const startBluetoothDevicesDiscovery = () => {
    if (_discoveryStarted) {
      return
    }
    _discoveryStarted = true
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: (res) => {
        console.log('startBluetoothDevicesDiscovery success', res)
        onBluetoothDeviceFound()
      },
    })
  }

  const onBluetoothDeviceFound = () => {
    wx.onBluetoothDeviceFound((res) => {
      res.devices.forEach(device => {
        if (!device.name && !device.localName) {
          return
        }
        const idx = inArray(devices, 'deviceId', device.deviceId)
        if (idx === -1) {
          let newDevices = devices
          newDevices.push(device)
          setDevices([...newDevices])
        }
      })
    })
  }

  const showDevicesList = (devices) => {
    return devices.map(device => {
      console.log(device)
      return <AtListItem title={device.name} note={device.deviceId} extraText={device.RSSI} onClick={() => {
        Taro.navigateTo({
          url: "/pages/chart/chart?deviceId=" + device.deviceId + "&name=" + device.name,
        })
      }} />
    })
  }

  return (
    <View className='index'>
      <AtButton type='primary' className='button' onClick={scanServices}>扫描外围服务</AtButton>
      <AtButton type='primary' className='button' onClick={() => {
        Taro.navigateTo({
          url: "/pages/service/service"
        })
      }}>创建外围服务</AtButton>
      <View>
        <AtList>
          {showDevicesList(devices)}
        </AtList>
      </View>
    </View>
  )
}

export default Index