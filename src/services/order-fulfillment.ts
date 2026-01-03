import { get, put } from './api';

interface OrderResponse {
  data: {
    id: number;
    attributes: {
      customername: string;
      quantity: string;
      total: number;
      ordernum: string;
      invoicenum: string;
      billingAddress: string;
      shippingAddress: string;
      phoneNum: string;
      email: string;
      Name: string;
      totalValue: number;
      skuid: string;
      prodid: string;
      shippingRate: number;
    };
  };
}

interface AWBResponse {
  data: Array<{
    id: number;
    attributes: {
      isUsed: boolean;
      awbNumber: string;
    };
  }>;
}

interface ProductWeightResponse {
  data: Array<{
    attributes: {
      weight: string;
    };
  }>;
}

interface CourierResponse {
  status: string;
  awbno: string;
  result: string;
}

const API_URL = import.meta.env.MODE === 'development' 
  ? '/api' 
  : 'https://api.dharaniherbbals.com/api';

export async function fulfillOrder(orderData: OrderResponse): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🚀 Starting order fulfillment for order:', orderData.data.attributes.ordernum);
    
    // 1. Get available AWB number
    console.log('📦 Fetching AWB numbers...');
    const awbResponse = await get<AWBResponse>('/awb-numbers?filters[isUsed][$eq]=false&pagination[limit]=1');
    console.log('📦 AWB Response:', awbResponse);
    
    if (!awbResponse.data.length) {
      throw new Error('No available AWB numbers');
    }

    const awbNumber = awbResponse.data[0].attributes.awbNumber;
    const awbId = awbResponse.data[0].id;
    console.log('📦 Selected AWB:', awbNumber);

    // 2. Calculate total weight from all products
    const skuIds = orderData.data.attributes.skuid.split(' | ');
    console.log('⚖️ Processing SKUs:', skuIds);
    let totalWeight = 0;

    for (const skuId of skuIds) {
      const productResponse = await get<ProductWeightResponse>(`/product-masters?filters[skuid][$eq]=${skuId.trim()}&fields[0]=weight`);
      console.log(`⚖️ Weight for SKU ${skuId}:`, productResponse.data[0]?.attributes.weight);
      if (productResponse.data.length > 0) {
        totalWeight += parseFloat(productResponse.data[0].attributes.weight);
      }
    }
    console.log('⚖️ Total weight:', totalWeight);

    // 3. Extract city and pincode from shipping address
    const shippingAddress = orderData.data.attributes.shippingAddress;
    const addressParts = shippingAddress.split(', ');
    const pincode = addressParts[addressParts.length - 1].match(/\d{6}/)?.[0] || '';
    const city = addressParts[addressParts.length - 2] || '';
    console.log('📍 Extracted - City:', city, 'Pincode:', pincode);

    // 4. Book courier
    const courierPayload = [{
      awbno: parseInt(awbNumber),
      refno: orderData.data.attributes.ordernum,
      orginsrc: "TNTST",
      frmname: "Kabilan",
      frmadd1: "First Street, Chennai",
      frmadd2: "",
      frmpincode: "600028",
      frmphone: "9999999990",
      toname: orderData.data.attributes.customername,
      toadd1: orderData.data.attributes.shippingAddress,
      toadd2: "",
      toarea: city,
      topincode: pincode,
      tophone: orderData.data.attributes.phoneNum,
      goodsname: orderData.data.attributes.Name,
      goodsvalue: orderData.data.attributes.totalValue.toString(),
      doctype: "N",
      transmode: "S",
      qty: orderData.data.attributes.quantity,
      weight: totalWeight.toFixed(3),
      volweight: "3.76",
      codamt: "0",
      invfiletype: "",
      invcopy: "0",
      ewaybill: ""
    }];

    console.log('🚚 Courier Payload:', JSON.stringify(courierPayload, null, 2));

    const courierResponse = await fetch(`${API_URL}/courier-booking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courierPayload)
    });

    console.log('🚚 Courier Response Status:', courierResponse.status);
    console.log('🚚 Courier Response Headers:', Object.fromEntries(courierResponse.headers.entries()));
    
    const courierResult: CourierResponse[] = await courierResponse.json();
    console.log('🚚 Courier Result:', courierResult);

    if (courierResult[0].status !== '1') {
      throw new Error(`Courier booking failed: ${courierResult[0].result}`);
    }

    // 5. Update order with AWB number and courier ref ID
    console.log('📝 Updating order with AWB:', courierResult[0].awbno);
    await put(`/orders/${orderData.data.id}`, {
      data: {
        awbNumber: courierResult[0].awbno,
        stCourierRefId: courierResult[0].awbno
      }
    });

    // 6. Mark AWB as used
    console.log('✅ Marking AWB as used');
    await put(`/awb-numbers/${awbId}`, {
      data: {
        isUsed: true,
        usedDate: new Date().toISOString().split('T')[0]
      }
    });

    console.log('🎉 Order fulfillment completed successfully!');
    return {
      success: true,
      message: `Order fulfilled successfully. AWB: ${courierResult[0].awbno}`
    };

  } catch (error) {
    console.error('❌ Order fulfillment failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}